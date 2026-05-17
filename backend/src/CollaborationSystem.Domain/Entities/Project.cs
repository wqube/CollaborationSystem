using CollaborationSystem.Domain.Common;

namespace CollaborationSystem.Domain.Entities;

public class Project : BaseEntity
{
    public const int DefaultVotesPerUser = 3;
    public const int DefaultVoteResetPeriodDays = 14;

    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public Guid CreatedByUserId { get; set; }
    public int VotesPerUser { get; set; } = DefaultVotesPerUser;
    public int VoteResetPeriodDays { get; set; } = DefaultVoteResetPeriodDays;

    public AppUser? CreatedByUser { get; set; }
    public ICollection<ProjectMember> Members { get; set; } = [];
    public ICollection<Suggestion> Suggestions { get; set; } = [];
    public ICollection<Draft> Drafts { get; set; } = [];
}
