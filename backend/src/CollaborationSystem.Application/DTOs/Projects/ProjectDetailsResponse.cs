namespace CollaborationSystem.Application.DTOs.Projects;

public sealed class ProjectDetailsResponse
{
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public Guid CreatedByUserId { get; set; }

    public DateTime CreatedAtUtc { get; set; }

    public DateTime UpdatedAtUtc { get; set; }

    public IReadOnlyList<ProjectMemberResponse> Members { get; set; } = [];
}
