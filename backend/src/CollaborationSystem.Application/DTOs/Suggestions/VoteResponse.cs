using CollaborationSystem.Application.DTOs.Projects;
using CollaborationSystem.Domain.Enums;

namespace CollaborationSystem.Application.DTOs.Suggestions;

public sealed class VoteResponse
{
    public Guid SuggestionId { get; set; }

    public VoteType? CurrentUserVote { get; set; }

    public int Score { get; set; }

    public CurrentUserVoteQuotaResponse VoteQuota { get; set; } = new();
}
