using CollaborationSystem.Domain.Enums;

namespace CollaborationSystem.Application.DTOs.Projects;

/// <summary>
/// Payload for changing a project member role.
/// </summary>
public sealed class UpdateProjectMemberRoleRequest
{
    /// <summary>
    /// New role for the project member.
    /// </summary>
    public ProjectRole Role { get; set; }
}
