using CollaborationSystem.Application.DTOs.Projects;

namespace CollaborationSystem.Application.Abstractions;

public interface IProjectMemberService
{
    Task<ProjectMemberOperationResult> AddMemberAsync(
        Guid projectId,
        AddProjectMemberRequest request,
        CancellationToken cancellationToken = default);

    Task<ProjectMemberOperationResult> UpdateMemberRoleAsync(
        Guid projectId,
        Guid userId,
        UpdateProjectMemberRoleRequest request,
        CancellationToken cancellationToken = default);

    Task<ProjectMemberOperationResult> RemoveMemberAsync(
        Guid projectId,
        Guid userId,
        CancellationToken cancellationToken = default);

    Task<ProjectMemberOperationResult> RemoveCurrentMemberAsync(
        Guid projectId,
        CancellationToken cancellationToken = default);
}
