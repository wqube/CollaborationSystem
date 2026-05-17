using CollaborationSystem.Domain.Common;
using CollaborationSystem.Domain.Enums;

namespace CollaborationSystem.Domain.Entities;

public class ProjectMember : BaseEntity
{
    public Guid ProjectId { get; set; }
    public Guid UserId { get; set; }
    public ProjectRole Role { get; set; } = ProjectRole.Member;
    public DateTime JoinedAtUtc { get; set; } = DateTime.UtcNow;
    public int VotesRemaining { get; set; } = Project.DefaultVotesPerUser;
    public DateTime VotePeriodStartedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime NextVoteResetAtUtc { get; set; } = DateTime.UtcNow.AddDays(Project.DefaultVoteResetPeriodDays);

    public Project? Project { get; set; }
    public AppUser? User { get; set; }
}
