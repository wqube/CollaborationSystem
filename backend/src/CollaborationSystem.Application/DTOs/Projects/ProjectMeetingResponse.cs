namespace CollaborationSystem.Application.DTOs.Projects;

public sealed class ProjectMeetingResponse
{
    public Guid Id { get; set; }

    public Guid ProjectId { get; set; }

    public Guid CreatedByUserId { get; set; }

    public string Title { get; set; } = string.Empty;

    public DateTime StartsAtUtc { get; set; }

    public DateTime? EndsAtUtc { get; set; }

    public string? Location { get; set; }

    public string? Agenda { get; set; }

    public DateTime CreatedAtUtc { get; set; }

    public DateTime UpdatedAtUtc { get; set; }
}
