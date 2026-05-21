using CollaborationSystem.Domain.Enums;

namespace CollaborationSystem.Application.DTOs.Projects;

/// <summary>
/// Compact project member representation.
/// </summary>
public sealed class ProjectMemberPreviewResponse
{
    /// <summary>
    /// User identifier.
    /// </summary>
    public Guid UserId { get; set; }

    /// <summary>
    /// User display name.
    /// </summary>
    public string DisplayName { get; set; } = string.Empty;

    /// <summary>
    /// User role in the project.
    /// </summary>
    public ProjectRole Role { get; set; }
}
