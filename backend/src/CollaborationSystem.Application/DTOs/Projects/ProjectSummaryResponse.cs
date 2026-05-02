using CollaborationSystem.Domain.Enums;

namespace CollaborationSystem.Application.DTOs.Projects;

public sealed class ProjectSummaryResponse
{
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public ProjectRole Role { get; set; }

    public DateTime LastAccessedAt { get; set; }

    public Guid CreatedByUserId { get; set; }

    public DateTime CreatedAtUtc { get; set; }

    public DateTime UpdatedAtUtc { get; set; }
}
