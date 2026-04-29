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

        var projectIdsQuery = dbContext.ProjectMembers
            .AsNoTracking()
            .Where(x => x.UserId == currentUserId)
            .Select(x => x.ProjectId);

        var projectsQuery = dbContext.Projects
            .AsNoTracking()
            .Where(x => projectIdsQuery.Contains(x.Id));

        var total = await projectsQuery.CountAsync(cancellationToken);
        var items = await projectsQuery
            .OrderByDescending(x => x.UpdatedAtUtc)
            .ThenBy(x => x.Name)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(ToProjectSummaryExpression())
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
        CancellationToken cancellationToken = default)
    {
        var projectResult = await GetProjectByIdAsync(projectId, cancellationToken);

        if (projectResult.Status != ProjectOperationStatus.Success || projectResult.Value is null)
        {
            return ProjectOperationResult<ProjectDashboardResponse>.Failure(projectResult.Status);
        }

        var suggestions = await dbContext.Suggestions
            .AsNoTracking()
            .Where(x => x.ProjectId == projectId)
            .OrderByDescending(x => x.CreatedAtUtc)
            .Take(10)
            .Select(x => new SuggestionPreviewResponse
            {
                Id = x.Id,
                Text = x.Text,
                Status = x.Status,
                Score = x.Votes.Count(v => v.VoteType == VoteType.Up) -
                        x.Votes.Count(v => v.VoteType == VoteType.Down),
                CreatedAtUtc = x.CreatedAtUtc
            })
            .ToListAsync(cancellationToken);

        return ProjectOperationResult<ProjectDashboardResponse>.Success(new ProjectDashboardResponse
        {
            Project = projectResult.Value,
            SuggestionsPreview = suggestions
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
                JoinedAtUtc = x.JoinedAtUtc
            })
            .ToListAsync(cancellationToken);

    private static System.Linq.Expressions.Expression<Func<Project, ProjectSummaryResponse>> ToProjectSummaryExpression() =>
        x => new ProjectSummaryResponse
        {
            Id = x.Id,
            Name = x.Name,
            Description = x.Description,
            CreatedByUserId = x.CreatedByUserId,
            CreatedAtUtc = x.CreatedAtUtc,
            UpdatedAtUtc = x.UpdatedAtUtc
        };
}
