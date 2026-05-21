namespace CollaborationSystem.Application.DTOs.Projects;

public sealed class CreateProjectMeetingRequest
{
    public string Title { get; set; } = string.Empty;

    public DateTime StartsAtUtc { get; set; }

    public DateTime? EndsAtUtc { get; set; }

    public string? Location { get; set; }

    public string? Agenda { get; set; }
}
