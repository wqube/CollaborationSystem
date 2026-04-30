using CollaborationSystem.Domain.Enums;

namespace CollaborationSystem.Application.DTOs.Suggestions;

public sealed class GetSuggestionsQuery
{
    public SuggestionStatus? Status { get; set; }

    public string? Search { get; set; }

    public string? Sort { get; set; }

    public string? Order { get; set; }

    public int Page { get; set; } = 1;

    public int PageSize { get; set; } = 10;
}
