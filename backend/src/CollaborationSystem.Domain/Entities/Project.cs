using CollaborationSystem.Domain.Common;

namespace CollaborationSystem.Domain.Entities;

public class Project : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public Guid CreatedByUserId { get; set; }
    public int VotesPerUser { get; set; } = 3;
    public int VoteResetPeriodDays { get; set; } = 14;
    public string? MeetingSchedule { get; set; }

    public AppUser? CreatedByUser { get; set; }
    public ICollection<ProjectMember> Members { get; set; } = [];
    public ICollection<Suggestion> Suggestions { get; set; } = [];
    public ICollection<Draft> Drafts { get; set; } = [];
}
