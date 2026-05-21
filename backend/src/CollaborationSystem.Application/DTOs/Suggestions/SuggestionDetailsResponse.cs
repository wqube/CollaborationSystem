namespace CollaborationSystem.Application.DTOs.Suggestions;

/// <summary>
/// Detailed suggestion data.
/// </summary>
public sealed class SuggestionDetailsResponse : SuggestionSummaryResponse
{
    /// <summary>
    /// Vote breakdown for the suggestion.
    /// </summary>
    public IReadOnlyList<VoteBreakdownItemResponse> Votes { get; set; } = [];
}
