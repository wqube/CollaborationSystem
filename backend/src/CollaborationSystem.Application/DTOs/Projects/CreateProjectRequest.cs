namespace CollaborationSystem.Application.DTOs.Projects;

/// <summary>
/// Payload for creating a project.
/// </summary>
public sealed class CreateProjectRequest
{
    /// <summary>
    /// Project name.
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Project description.
    /// </summary>
    public string Description { get; set; } = string.Empty;
}
