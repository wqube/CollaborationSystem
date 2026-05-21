using CollaborationSystem.Domain.Common;

namespace CollaborationSystem.Domain.Entities;

public class ProjectMeeting : BaseEntity
{
    public Guid ProjectId { get; set; }
    public Guid CreatedByUserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public DateTime StartsAtUtc { get; set; }
    public DateTime? EndsAtUtc { get; set; }
    public string? Location { get; set; }
    public string? Agenda { get; set; }

    public Project? Project { get; set; }
    public AppUser? CreatedByUser { get; set; }
}
