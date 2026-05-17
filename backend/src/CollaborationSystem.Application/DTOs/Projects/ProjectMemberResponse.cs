using CollaborationSystem.Domain.Enums;

namespace CollaborationSystem.Application.DTOs.Projects;

/// <summary>
/// Project member data.
/// </summary>
public sealed class ProjectMemberResponse
{
    /// <summary>
    /// Project identifier.
    /// </summary>
    public Guid ProjectId { get; set; }

    /// <summary>
    /// User identifier.
    /// </summary>
    public Guid UserId { get; set; }

    /// <summary>
    /// User display name.
    /// </summary>
    public string DisplayName { get; set; } = string.Empty;

    /// <summary>
    /// User email address.
    /// </summary>
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// User role in the project.
    /// </summary>
    public ProjectRole Role { get; set; }

    /// <summary>
    /// Timestamp when the user joined the project.
    /// </summary>
    public DateTime JoinedAt { get; set; }
}
