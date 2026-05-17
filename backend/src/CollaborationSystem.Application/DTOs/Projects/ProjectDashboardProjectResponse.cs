using CollaborationSystem.Domain.Enums;

namespace CollaborationSystem.Application.DTOs.Projects;

/// <summary>
/// Project metadata shown in the dashboard response.
/// </summary>
public sealed class ProjectDashboardProjectResponse
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
}
