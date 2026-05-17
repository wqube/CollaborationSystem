using CollaborationSystem.Domain.Enums;

namespace CollaborationSystem.Application.DTOs.Projects;

/// <summary>
/// Payload for adding a user to a project.
/// </summary>
public sealed class AddProjectMemberRequest
{
    /// <summary>
    /// User to add as a project member.
    /// </summary>
    public Guid UserId { get; set; }

    /// <summary>
    /// Role to assign to the user.
    /// </summary>
    public ProjectRole Role { get; set; } = ProjectRole.Member;
}
