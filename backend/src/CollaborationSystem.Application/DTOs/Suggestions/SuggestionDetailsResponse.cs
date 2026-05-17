namespace CollaborationSystem.Application.DTOs.Suggestions;

public sealed class SuggestionDetailsResponse : SuggestionSummaryResponse
{
    public IReadOnlyList<VoteBreakdownItemResponse> Votes { get; set; } = [];
}
