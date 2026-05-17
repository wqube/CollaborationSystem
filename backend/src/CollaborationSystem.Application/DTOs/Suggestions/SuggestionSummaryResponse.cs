using CollaborationSystem.Domain.Enums;

namespace CollaborationSystem.Application.DTOs.Suggestions;

/// <summary>
/// Suggestion summary data.
/// </summary>
public class SuggestionSummaryResponse
{
    /// <summary>
    /// Suggestion identifier.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Project that owns the suggestion.
    /// </summary>
    public Guid ProjectId { get; set; }

    /// <summary>
    /// Suggestion text.
    /// </summary>
    public string Text { get; set; } = string.Empty;

    /// <summary>
    /// Current suggestion status.
    /// </summary>
    public SuggestionStatus Status { get; set; }

    /// <summary>
    /// Suggestion author.
    /// </summary>
    public SuggestionAuthorResponse Author { get; set; } = new();

    /// <summary>
    /// Current vote score.
    /// </summary>
    public int Score { get; set; }

    /// <summary>
    /// Current user's vote, if any.
    /// </summary>
    public VoteType? CurrentUserVote { get; set; }

    /// <summary>
    /// Suggestion creation timestamp in UTC.
    /// </summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// Suggestion update timestamp in UTC.
    /// </summary>
    public DateTime UpdatedAt { get; set; }
}
