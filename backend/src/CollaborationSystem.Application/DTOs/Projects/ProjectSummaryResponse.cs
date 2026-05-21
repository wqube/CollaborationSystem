using CollaborationSystem.Domain.Enums;

namespace CollaborationSystem.Application.DTOs.Projects;

/// <summary>
/// Project summary data returned in lists and mutations.
/// </summary>
public sealed class ProjectSummaryResponse
{
    /// <summary>
    /// Project identifier.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Project name.
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Project description.
    /// </summary>
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// Current user's role in the project.
    /// </summary>
    public ProjectRole Role { get; set; }

    /// <summary>
    /// Timestamp when the current user last accessed the project.
    /// </summary>
    public DateTime LastAccessedAt { get; set; }

    /// <summary>
    /// Identifier of the user who created the project.
    /// </summary>
    public Guid CreatedByUserId { get; set; }

    /// <summary>
    /// Project creation timestamp in UTC.
    /// </summary>
    public DateTime CreatedAtUtc { get; set; }

    /// <summary>
    /// Project update timestamp in UTC.
    /// </summary>
    public DateTime UpdatedAtUtc { get; set; }
}
