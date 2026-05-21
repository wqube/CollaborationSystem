using CollaborationSystem.Application.Abstractions;
using CollaborationSystem.Application.DTOs.Projects;
using CollaborationSystem.Application.DTOs.Suggestions;
using CollaborationSystem.Domain.Entities;
using CollaborationSystem.Domain.Enums;
using CollaborationSystem.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;

namespace CollaborationSystem.Infrastructure.Projects;

public sealed class ProjectService(
    AppDbContext dbContext,
    ICurrentUserService currentUserService,
    VoteQuotaService voteQuotaService) : IProjectService
{
    public async Task<PagedResponse<ProjectSummaryResponse>> GetProjectsAsync(
        GetProjectsQuery query,
        CancellationToken cancellationToken = default)
    {
        var currentUserId = currentUserService.GetRequiredUserId();

        var projectMembershipsQuery = dbContext.ProjectMembers
            .AsNoTracking()
            .Where(x => x.UserId == currentUserId)
            .Where(x => x.Project != null && x.Project.DeletedAtUtc == null);

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
                LastAccessedAt = x.LastAccessedAtUtc,
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
        var currentUserId = currentUserService.GetRequiredUserId();
        var member = await dbContext.ProjectMembers
            .Include(x => x.Project)
            .FirstOrDefaultAsync(
                x => x.ProjectId == projectId && x.UserId == currentUserId,
                cancellationToken);

        if (member is null)
        {
            var projectExists = await dbContext.Projects
                .AsNoTracking()
                .AnyAsync(x => x.Id == projectId && x.DeletedAtUtc == null, cancellationToken);

            return ProjectOperationResult<ProjectDetailsResponse>.Failure(
                projectExists ? ProjectOperationStatus.Forbidden : ProjectOperationStatus.ProjectNotFound);
        }

        var project = member.Project!;
        if (project.DeletedAtUtc is not null)
        {
            return ProjectOperationResult<ProjectDetailsResponse>.Failure(ProjectOperationStatus.ProjectNotFound);
        }

        var utcNow = DateTime.UtcNow;
        member.LastAccessedAtUtc = utcNow;
        member.UpdatedAtUtc = utcNow;

        if (voteQuotaService.ApplyLazyReset(project, member, utcNow))
        {
            member.UpdatedAtUtc = utcNow;
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        var members = await GetProjectMembersAsync(projectId, cancellationToken);

        return ProjectOperationResult<ProjectDetailsResponse>.Success(new ProjectDetailsResponse
        {
            Id = project.Id,
            Name = project.Name,
            Description = project.Description,
            CreatedByUserId = project.CreatedByUserId,
            CreatedAtUtc = project.CreatedAtUtc,
            UpdatedAtUtc = project.UpdatedAtUtc,
            VoteSettings = ToVoteSettingsResponse(project),
            CurrentUserVoteQuota = voteQuotaService.ToResponse(project, member),
            Members = members
        });
    }

    public async Task<ProjectOperationResult<ProjectDashboardResponse>> GetProjectDashboardAsync(
        Guid projectId,
        GetProjectDashboardQuery query,
        CancellationToken cancellationToken = default)
    {
        var currentUserId = currentUserService.GetRequiredUserId();
        var member = await dbContext.ProjectMembers
            .Include(x => x.Project)
            .FirstOrDefaultAsync(
                x => x.ProjectId == projectId && x.UserId == currentUserId,
                cancellationToken);

        if (member is null)
        {
            var projectExists = await dbContext.Projects
                .AsNoTracking()
                .AnyAsync(x => x.Id == projectId && x.DeletedAtUtc == null, cancellationToken);

            return ProjectOperationResult<ProjectDashboardResponse>.Failure(
                projectExists ? ProjectOperationStatus.Forbidden : ProjectOperationStatus.ProjectNotFound);
        }

        var project = member.Project!;
        if (project.DeletedAtUtc is not null)
        {
            return ProjectOperationResult<ProjectDashboardResponse>.Failure(ProjectOperationStatus.ProjectNotFound);
        }

        var utcNow = DateTime.UtcNow;
        member.LastAccessedAtUtc = utcNow;
        member.UpdatedAtUtc = utcNow;

        if (voteQuotaService.ApplyLazyReset(project, member, utcNow))
        {
            member.UpdatedAtUtc = utcNow;
        }

        await dbContext.SaveChangesAsync(cancellationToken);

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
                CurrentUserVote = x.Votes
                    .Where(v => v.UserId == currentUserId)
                    .Select(v => (VoteType?)v.VoteType)
                    .FirstOrDefault(),
                CreatedAt = x.CreatedAtUtc,
                UpdatedAt = x.UpdatedAtUtc
            })
            .ToListAsync(cancellationToken);

        return ProjectOperationResult<ProjectDashboardResponse>.Success(new ProjectDashboardResponse
        {
            Project = new ProjectDashboardProjectResponse
            {
                Id = project.Id,
                Name = project.Name,
                Description = project.Description,
                Role = member.Role,
                LastAccessedAt = member.LastAccessedAtUtc
            },
            VoteSettings = ToVoteSettingsResponse(project),
            CurrentUserVoteQuota = voteQuotaService.ToResponse(project, member),
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

    public async Task<ProjectOperationResult<ProjectSummaryResponse>> CreateProjectAsync(
        CreateProjectRequest request,
        CancellationToken cancellationToken = default)
    {
        var currentUserId = currentUserService.GetRequiredUserId();
        var utcNow = DateTime.UtcNow;
        var name = request.Name.Trim();
        var normalizedName = NormalizeValue(name);

        var projectAlreadyExists = await dbContext.Projects
            .AsNoTracking()
            .AnyAsync(
                x => x.DeletedAtUtc == null && x.NormalizedName == normalizedName,
                cancellationToken);

        if (projectAlreadyExists)
        {
            return ProjectOperationResult<ProjectSummaryResponse>.Failure(ProjectOperationStatus.Conflict);
        }

        var project = new Project
        {
            Name = name,
            NormalizedName = normalizedName,
            Description = request.Description.Trim(),
            CreatedByUserId = currentUserId,
            CreatedAtUtc = utcNow,
            UpdatedAtUtc = utcNow
        };

        dbContext.Projects.Add(project);
        var member = new ProjectMember
        {
            ProjectId = project.Id,
            UserId = currentUserId,
            Role = ProjectRole.Admin,
            JoinedAtUtc = utcNow,
            LastAccessedAtUtc = utcNow,
            CreatedAtUtc = utcNow,
            UpdatedAtUtc = utcNow
        };

        VoteQuotaService.InitializeQuota(project, member, utcNow);
        dbContext.ProjectMembers.Add(member);

        await dbContext.SaveChangesAsync(cancellationToken);

        return ProjectOperationResult<ProjectSummaryResponse>.Success(new ProjectSummaryResponse
        {
            Id = project.Id,
            Name = project.Name,
            Description = project.Description,
            Role = ProjectRole.Admin,
            LastAccessedAt = member.LastAccessedAtUtc,
            CreatedByUserId = project.CreatedByUserId,
            CreatedAtUtc = project.CreatedAtUtc,
            UpdatedAtUtc = project.UpdatedAtUtc
        });
    }

    public async Task<ProjectOperationResult<bool>> DeleteProjectAsync(
        Guid projectId,
        CancellationToken cancellationToken = default)
    {
        var project = await dbContext.Projects
            .FirstOrDefaultAsync(x => x.Id == projectId && x.DeletedAtUtc == null, cancellationToken);

        if (project is null)
        {
            return ProjectOperationResult<bool>.Failure(ProjectOperationStatus.ProjectNotFound);
        }

        var currentUserId = currentUserService.GetRequiredUserId();
        var currentMember = await dbContext.ProjectMembers
            .AsNoTracking()
            .FirstOrDefaultAsync(
                x => x.ProjectId == projectId && x.UserId == currentUserId,
                cancellationToken);

        if (currentMember is null || currentMember.Role != ProjectRole.Admin)
        {
            return ProjectOperationResult<bool>.Failure(ProjectOperationStatus.Forbidden);
        }

        var utcNow = DateTime.UtcNow;
        project.DeletedAtUtc = utcNow;
        project.UpdatedAtUtc = utcNow;

        await dbContext.SaveChangesAsync(cancellationToken);

        return ProjectOperationResult<bool>.Success(true);
    }

    public async Task<ProjectOperationResult<ProjectVoteSettingsResponse>> UpdateProjectSettingsAsync(
        Guid projectId,
        UpdateProjectSettingsRequest request,
        CancellationToken cancellationToken = default)
    {
        var currentUserId = currentUserService.GetRequiredUserId();
        var member = await dbContext.ProjectMembers
            .Include(x => x.Project)
            .FirstOrDefaultAsync(
                x => x.ProjectId == projectId && x.UserId == currentUserId,
                cancellationToken);

        if (member is null)
        {
            var projectExists = await dbContext.Projects
                .AsNoTracking()
                .AnyAsync(x => x.Id == projectId && x.DeletedAtUtc == null, cancellationToken);

            return ProjectOperationResult<ProjectVoteSettingsResponse>.Failure(
                projectExists ? ProjectOperationStatus.Forbidden : ProjectOperationStatus.ProjectNotFound);
        }

        if (member.Project is null || member.Project.DeletedAtUtc is not null)
        {
            return ProjectOperationResult<ProjectVoteSettingsResponse>.Failure(ProjectOperationStatus.ProjectNotFound);
        }

        if (member.Role != ProjectRole.Admin)
        {
            return ProjectOperationResult<ProjectVoteSettingsResponse>.Failure(ProjectOperationStatus.Forbidden);
        }

        var project = member.Project!;
        var utcNow = DateTime.UtcNow;

        project.VotesPerUser = request.VotesPerUser;
        project.VoteResetPeriodDays = request.VoteResetPeriodDays;
        project.UpdatedAtUtc = utcNow;

        await voteQuotaService.RecalculateProjectQuotasAsync(project, utcNow, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);

        return ProjectOperationResult<ProjectVoteSettingsResponse>.Success(ToVoteSettingsResponse(project));
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

    private static ProjectVoteSettingsResponse ToVoteSettingsResponse(Project project) =>
        new()
        {
            VotesPerUser = project.VotesPerUser,
            VoteResetPeriodDays = project.VoteResetPeriodDays
        };

    private static string NormalizeValue(string value) =>
        Regex.Replace(value.Trim(), @"\s+", " ").ToUpperInvariant();
}
