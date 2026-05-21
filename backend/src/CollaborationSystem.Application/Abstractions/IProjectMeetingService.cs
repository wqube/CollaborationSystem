using CollaborationSystem.Application.DTOs.Projects;

namespace CollaborationSystem.Application.Abstractions;

public interface IProjectMeetingService
{
    Task<ProjectOperationResult<IReadOnlyList<ProjectMeetingResponse>>> GetMeetingsAsync(
        Guid projectId,
        CancellationToken cancellationToken = default);

    Task<ProjectOperationResult<ProjectMeetingResponse>> CreateMeetingAsync(
        Guid projectId,
        CreateProjectMeetingRequest request,
        CancellationToken cancellationToken = default);

    Task<ProjectOperationResult<bool>> DeleteMeetingAsync(
        Guid projectId,
        Guid meetingId,
        CancellationToken cancellationToken = default);
}
