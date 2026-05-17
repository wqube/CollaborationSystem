using CollaborationSystem.Domain.Enums;

namespace CollaborationSystem.Application.DTOs.Suggestions;

/// <summary>
/// Query parameters for listing suggestions.
/// </summary>
public sealed class GetSuggestionsQuery
{
    /// <summary>
    /// Optional suggestion status filter.
    /// </summary>
    public SuggestionStatus? Status { get; set; }

    /// <summary>
    /// Optional search text matched against suggestion text.
    /// </summary>
    public string? Search { get; set; }

    /// <summary>
    /// Optional sort field. Supported values are createdAt, updatedAt, and score.
    /// </summary>
    public string? Sort { get; set; }

    /// <summary>
    /// Optional sort direction: asc or desc.
    /// </summary>
    public string? Order { get; set; }

    /// <summary>
    /// One-based page number.
    /// </summary>
    public int Page { get; set; } = 1;

    /// <summary>
    /// Number of suggestions per page.
    /// </summary>
    public int PageSize { get; set; } = 10;
}
