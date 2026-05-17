namespace CollaborationSystem.Application.DTOs.Projects;

/// <summary>
/// Payload for updating project fields.
/// </summary>
public sealed class UpdateProjectRequest
{
    /// <summary>
    /// New project name.
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// New project description.
    /// </summary>
    public string? Description { get; set; }
}
