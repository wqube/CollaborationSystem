using CollaborationSystem.Application.Abstractions;
using CollaborationSystem.Application.DTOs.Projects;
using CollaborationSystem.Application.DTOs.Suggestions;
using CollaborationSystem.Domain.Entities;
using CollaborationSystem.Domain.Enums;
using CollaborationSystem.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace CollaborationSystem.Infrastructure.Projects;

public sealed class ProjectService(
    AppDbContext dbContext,
    ICurrentUserService currentUserService) : IProjectService
{
    public async Task<PagedResponse<ProjectSummaryResponse>> GetProjectsAsync(
        GetProjectsQuery query,
        CancellationToken cancellationToken = default)
    {
        var currentUserId = currentUserService.GetRequiredUserId();

        var projectMembershipsQuery = dbContext.ProjectMembers
            .AsNoTracking()
            .Where(x => x.UserId == currentUserId)
            .Where(x => x.Project != null);

        var total = await projectMembershipsQuery.CountAsync(cancellationToken);
        var items = await projectMembershipsQuery
            .OrderByDescending(x => x.Project!.UpdatedAtUtc)
            .ThenBy(x => x.Project!.Name)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(x => new ProjectSummaryResponse
            {
                Id = x.Project!.Id,
                Name = x.Project.Name,
                Description = x.Project.Description,
                Role = x.Role,
                LastAccessedAt = x.Project.UpdatedAtUtc,
                CreatedByUserId = x.Project.CreatedByUserId,
                CreatedAtUtc = x.Project.CreatedAtUtc,
                UpdatedAtUtc = x.Project.UpdatedAtUtc
            })
            .ToListAsync(cancellationToken);

        return new PagedResponse<ProjectSummaryResponse>
        {
            Items = items,
            Page = query.Page,
            PageSize = query.PageSize,
            Total = total
        };
    }

    public async Task<ProjectOperationResult<ProjectDetailsResponse>> GetProjectByIdAsync(
        Guid projectId,
        CancellationToken cancellationToken = default)
    {
        var accessStatus = await GetProjectAccessStatusAsync(projectId, cancellationToken);

        if (accessStatus != ProjectOperationStatus.Success)
        {
            return ProjectOperationResult<ProjectDetailsResponse>.Failure(accessStatus);
        }

        var project = await dbContext.Projects
            .AsNoTracking()
            .Where(x => x.Id == projectId)
            .Select(ToProjectSummaryExpression())
            .FirstOrDefaultAsync(cancellationToken);

        if (project is null)
        {
            return ProjectOperationResult<ProjectDetailsResponse>.Failure(ProjectOperationStatus.ProjectNotFound);
        }

        var members = await GetProjectMembersAsync(projectId, cancellationToken);

        return ProjectOperationResult<ProjectDetailsResponse>.Success(new ProjectDetailsResponse
        {
            Id = project.Id,
            Name = project.Name,
            Description = project.Description,
            CreatedByUserId = project.CreatedByUserId,
            CreatedAtUtc = project.CreatedAtUtc,
            UpdatedAtUtc = project.UpdatedAtUtc,
            Members = members
        });
    }

    public async Task<ProjectOperationResult<ProjectDashboardResponse>> GetProjectDashboardAsync(
        Guid projectId,
        GetProjectDashboardQuery query,
        CancellationToken cancellationToken = default)
    {
        var accessStatus = await GetProjectAccessStatusAsync(projectId, cancellationToken);
        if (accessStatus != ProjectOperationStatus.Success)
        {
            return ProjectOperationResult<ProjectDashboardResponse>.Failure(accessStatus);
        }

        var currentUserId = currentUserService.GetRequiredUserId();

        var projectWithRole = await dbContext.ProjectMembers
            .AsNoTracking()
            .Where(x => x.ProjectId == projectId && x.UserId == currentUserId)
            .Select(x => new
            {
                x.Role,
                Project = x.Project!
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (projectWithRole is null)
        {
            return ProjectOperationResult<ProjectDashboardResponse>.Failure(ProjectOperationStatus.Forbidden);
        }

        var membersPreview = await dbContext.ProjectMembers
            .AsNoTracking()
            .Where(x => x.ProjectId == projectId)
            .OrderByDescending(x => x.Role)
            .ThenBy(x => x.JoinedAtUtc)
            .Take(10)
            .Select(x => new ProjectMemberPreviewResponse
            {
                UserId = x.UserId,
                DisplayName = x.User == null ? string.Empty : x.User.DisplayName,
                Role = x.Role
            })
            .ToListAsync(cancellationToken);

        var suggestionsQuery = dbContext.Suggestions
            .AsNoTracking()
            .Where(x => x.ProjectId == projectId);

        if (query.Status.HasValue)
        {
            suggestionsQuery = suggestionsQuery.Where(x => x.Status == query.Status.Value);
        }

        var suggestionsTotal = await suggestionsQuery.CountAsync(cancellationToken);

        var suggestions = await dbContext.Suggestions
            .AsNoTracking()
            .Where(x => x.ProjectId == projectId && (!query.Status.HasValue || x.Status == query.Status.Value))
            .OrderByDescending(x => x.CreatedAtUtc)
            .ThenByDescending(x => x.Id)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(x => new SuggestionPreviewResponse
            {
                Id = x.Id,
                ProjectId = x.ProjectId,
                Text = x.Text,
                Status = x.Status,
                Author = new SuggestionAuthorResponse
                {
                    Id = x.AuthorId,
                    DisplayName = x.Author == null ? string.Empty : x.Author.DisplayName
                },
                Score = x.Votes.Count(v => v.VoteType == VoteType.Up) -
                        x.Votes.Count(v => v.VoteType == VoteType.Down),
                CreatedAt = x.CreatedAtUtc,
                UpdatedAt = x.UpdatedAtUtc
            })
            .ToListAsync(cancellationToken);

        return ProjectOperationResult<ProjectDashboardResponse>.Success(new ProjectDashboardResponse
        {
            Project = new ProjectDashboardProjectResponse
            {
                Id = projectWithRole.Project.Id,
                Name = projectWithRole.Project.Name,
                Description = projectWithRole.Project.Description,
                Role = projectWithRole.Role,
                LastAccessedAt = projectWithRole.Project.UpdatedAtUtc
            },
            MembersPreview = membersPreview,
            Suggestions = new PagedResponse<SuggestionSummaryResponse>
            {
                Items = suggestions,
                Page = query.Page,
                PageSize = query.PageSize,
                Total = suggestionsTotal
            }
        });
    }

    public async Task<ProjectSummaryResponse> CreateProjectAsync(
        CreateProjectRequest request,
        CancellationToken cancellationToken = default)
    {
        var currentUserId = currentUserService.GetRequiredUserId();
        var utcNow = DateTime.UtcNow;

        var project = new Project
        {
            Name = request.Name.Trim(),
            Description = request.Description.Trim(),
            CreatedByUserId = currentUserId,
            CreatedAtUtc = utcNow,
            UpdatedAtUtc = utcNow
        };

        dbContext.Projects.Add(project);
        dbContext.ProjectMembers.Add(new ProjectMember
        {
            ProjectId = project.Id,
            UserId = currentUserId,
            Role = ProjectRole.Admin,
            JoinedAtUtc = utcNow,
            CreatedAtUtc = utcNow,
            UpdatedAtUtc = utcNow
        });

        await dbContext.SaveChangesAsync(cancellationToken);

        return new ProjectSummaryResponse
        {
            Id = project.Id,
            Name = project.Name,
            Description = project.Description,
            Role = ProjectRole.Admin,
            LastAccessedAt = project.UpdatedAtUtc,
            CreatedByUserId = project.CreatedByUserId,
            CreatedAtUtc = project.CreatedAtUtc,
            UpdatedAtUtc = project.UpdatedAtUtc
        };
    }

    private async Task<ProjectOperationStatus> GetProjectAccessStatusAsync(
        Guid projectId,
        CancellationToken cancellationToken)
    {
        var projectExists = await dbContext.Projects
            .AsNoTracking()
            .AnyAsync(x => x.Id == projectId, cancellationToken);

        if (!projectExists)
        {
            return ProjectOperationStatus.ProjectNotFound;
        }

        var currentUserId = currentUserService.GetRequiredUserId();
        var isMember = await dbContext.ProjectMembers
            .AsNoTracking()
            .AnyAsync(x => x.ProjectId == projectId && x.UserId == currentUserId, cancellationToken);

        return isMember ? ProjectOperationStatus.Success : ProjectOperationStatus.Forbidden;
    }

    private async Task<IReadOnlyList<ProjectMemberResponse>> GetProjectMembersAsync(
        Guid projectId,
        CancellationToken cancellationToken) =>
        await dbContext.ProjectMembers
            .AsNoTracking()
            .Where(x => x.ProjectId == projectId)
            .OrderByDescending(x => x.Role)
            .ThenBy(x => x.JoinedAtUtc)
            .Select(x => new ProjectMemberResponse
            {
                ProjectId = x.ProjectId,
                UserId = x.UserId,
                DisplayName = x.User == null ? string.Empty : x.User.DisplayName,
                Email = x.User == null ? string.Empty : x.User.Email,
                Role = x.Role,
                JoinedAt = x.JoinedAtUtc
            })
            .ToListAsync(cancellationToken);

    private static System.Linq.Expressions.Expression<Func<Project, ProjectSummaryResponse>> ToProjectSummaryExpression() =>
        x => new ProjectSummaryResponse
        {
            Id = x.Id,
            Name = x.Name,
            Description = x.Description,
            LastAccessedAt = x.UpdatedAtUtc,
            CreatedByUserId = x.CreatedByUserId,
            CreatedAtUtc = x.CreatedAtUtc,
            UpdatedAtUtc = x.UpdatedAtUtc
        };
}
