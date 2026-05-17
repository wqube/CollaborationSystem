using CollaborationSystem.Domain.Common;
using CollaborationSystem.Domain.Enums;

namespace CollaborationSystem.Domain.Entities;

public class Vote : BaseEntity
{
    public Guid SuggestionId { get; set; }
    public Guid UserId { get; set; }
    public VoteType VoteType { get; set; }
    public DateTime BudgetPeriodStartedAtUtc { get; set; } = DateTime.UtcNow;

    public Suggestion? Suggestion { get; set; }
    public AppUser? User { get; set; }
}
