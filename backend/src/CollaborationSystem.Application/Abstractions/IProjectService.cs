using CollaborationSystem.Application.DTOs.Projects;
using CollaborationSystem.Application.DTOs.Suggestions;

namespace CollaborationSystem.Application.Abstractions;

public interface IProjectService
{
    Task<PagedResponse<ProjectSummaryResponse>> GetProjectsAsync(
        GetProjectsQuery query,
        CancellationToken cancellationToken = default);

    Task<ProjectOperationResult<ProjectDetailsResponse>> GetProjectByIdAsync(
        Guid projectId,
        CancellationToken cancellationToken = default);

    Task<ProjectOperationResult<ProjectDashboardResponse>> GetProjectDashboardAsync(
        Guid projectId,
        GetProjectDashboardQuery query,
        CancellationToken cancellationToken = default);

    Task<ProjectSummaryResponse> CreateProjectAsync(
        CreateProjectRequest request,
        CancellationToken cancellationToken = default);

    Task<ProjectOperationResult<bool>> DeleteProjectAsync(
        Guid projectId,
        CancellationToken cancellationToken = default);
}
