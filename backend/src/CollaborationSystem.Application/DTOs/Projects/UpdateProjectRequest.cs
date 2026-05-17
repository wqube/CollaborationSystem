namespace CollaborationSystem.Application.DTOs.Projects;

public sealed class UpdateProjectRequest
{
    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }
}
