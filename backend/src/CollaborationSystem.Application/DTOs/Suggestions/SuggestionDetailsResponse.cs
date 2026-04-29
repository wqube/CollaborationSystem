using CollaborationSystem.Domain.Enums;

namespace CollaborationSystem.Application.DTOs.Suggestions;

public sealed class SuggestionDetailsResponse : SuggestionSummaryResponse
{
    public VoteType? CurrentUserVote { get; set; }

    public IReadOnlyList<VoteBreakdownItemResponse> Votes { get; set; } = [];
}
