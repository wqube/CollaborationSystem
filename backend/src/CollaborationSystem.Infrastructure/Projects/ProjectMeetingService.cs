using CollaborationSystem.Application.Abstractions;
using CollaborationSystem.Application.DTOs.Projects;
using CollaborationSystem.Domain.Entities;
using CollaborationSystem.Domain.Enums;
using CollaborationSystem.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace CollaborationSystem.Infrastructure.Projects;

public sealed class ProjectMeetingService(
    AppDbContext dbContext,
    ICurrentUserService currentUserService) : IProjectMeetingService
{
    public async Task<ProjectOperationResult<IReadOnlyList<ProjectMeetingResponse>>> GetMeetingsAsync(
        Guid projectId,
        CancellationToken cancellationToken = default)
    {
        var accessStatus = await GetCurrentUserAccessStatusAsync(projectId, requireAdmin: false, cancellationToken);
        if (accessStatus != ProjectOperationStatus.Success)
        {
            return ProjectOperationResult<IReadOnlyList<ProjectMeetingResponse>>.Failure(accessStatus);
        }

        var meetings = await dbContext.ProjectMeetings
            .AsNoTracking()
            .Where(x => x.ProjectId == projectId)
            .OrderBy(x => x.StartsAtUtc)
            .ThenBy(x => x.CreatedAtUtc)
            .Select(x => new ProjectMeetingResponse
            {
                Id = x.Id,
                ProjectId = x.ProjectId,
                CreatedByUserId = x.CreatedByUserId,
                Title = x.Title,
                StartsAtUtc = x.StartsAtUtc,
                EndsAtUtc = x.EndsAtUtc,
                Location = x.Location,
                Agenda = x.Agenda,
                CreatedAtUtc = x.CreatedAtUtc,
                UpdatedAtUtc = x.UpdatedAtUtc
            })
            .ToListAsync(cancellationToken);

        return ProjectOperationResult<IReadOnlyList<ProjectMeetingResponse>>.Success(meetings);
    }

    public async Task<ProjectOperationResult<ProjectMeetingResponse>> CreateMeetingAsync(
        Guid projectId,
        CreateProjectMeetingRequest request,
        CancellationToken cancellationToken = default)
    {
        var accessStatus = await GetCurrentUserAccessStatusAsync(projectId, requireAdmin: true, cancellationToken);
        if (accessStatus != ProjectOperationStatus.Success)
        {
            return ProjectOperationResult<ProjectMeetingResponse>.Failure(accessStatus);
        }

        var currentUserId = currentUserService.GetRequiredUserId();
        var utcNow = DateTime.UtcNow;
        var meeting = new ProjectMeeting
        {
            ProjectId = projectId,
            CreatedByUserId = currentUserId,
            Title = request.Title.Trim(),
            StartsAtUtc = request.StartsAtUtc,
            EndsAtUtc = request.EndsAtUtc,
            Location = string.IsNullOrWhiteSpace(request.Location) ? null : request.Location.Trim(),
            Agenda = string.IsNullOrWhiteSpace(request.Agenda) ? null : request.Agenda.Trim(),
            CreatedAtUtc = utcNow,
            UpdatedAtUtc = utcNow
        };

        dbContext.ProjectMeetings.Add(meeting);
        await dbContext.SaveChangesAsync(cancellationToken);

        return ProjectOperationResult<ProjectMeetingResponse>.Success(ToResponse(meeting));
    }

    public async Task<ProjectOperationResult<bool>> DeleteMeetingAsync(
        Guid projectId,
        Guid meetingId,
        CancellationToken cancellationToken = default)
    {
        var accessStatus = await GetCurrentUserAccessStatusAsync(projectId, requireAdmin: true, cancellationToken);
        if (accessStatus != ProjectOperationStatus.Success)
        {
            return ProjectOperationResult<bool>.Failure(accessStatus);
        }

        var meeting = await dbContext.ProjectMeetings
            .FirstOrDefaultAsync(x => x.Id == meetingId && x.ProjectId == projectId, cancellationToken);

        if (meeting is null)
        {
            return ProjectOperationResult<bool>.Failure(ProjectOperationStatus.ProjectMeetingNotFound);
        }

        dbContext.ProjectMeetings.Remove(meeting);
        await dbContext.SaveChangesAsync(cancellationToken);

        return ProjectOperationResult<bool>.Success(true);
    }

    private async Task<ProjectOperationStatus> GetCurrentUserAccessStatusAsync(
        Guid projectId,
        bool requireAdmin,
        CancellationToken cancellationToken)
    {
        var currentUserId = currentUserService.GetRequiredUserId();
        var member = await dbContext.ProjectMembers
            .AsNoTracking()
            .Include(x => x.Project)
            .FirstOrDefaultAsync(
                x => x.ProjectId == projectId && x.UserId == currentUserId,
                cancellationToken);

        if (member is null)
        {
            var projectExists = await dbContext.Projects
                .AsNoTracking()
                .AnyAsync(x => x.Id == projectId && x.DeletedAtUtc == null, cancellationToken);

            return projectExists ? ProjectOperationStatus.Forbidden : ProjectOperationStatus.ProjectNotFound;
        }

        if (member.Project is null || member.Project.DeletedAtUtc is not null)
        {
            return ProjectOperationStatus.ProjectNotFound;
        }

        return requireAdmin && member.Role != ProjectRole.Admin
            ? ProjectOperationStatus.Forbidden
            : ProjectOperationStatus.Success;
    }

    private static ProjectMeetingResponse ToResponse(ProjectMeeting meeting) =>
        new()
        {
            Id = meeting.Id,
            ProjectId = meeting.ProjectId,
            CreatedByUserId = meeting.CreatedByUserId,
            Title = meeting.Title,
            StartsAtUtc = meeting.StartsAtUtc,
            EndsAtUtc = meeting.EndsAtUtc,
            Location = meeting.Location,
            Agenda = meeting.Agenda,
            CreatedAtUtc = meeting.CreatedAtUtc,
            UpdatedAtUtc = meeting.UpdatedAtUtc
        };
}
