using CollaborationSystem.Application.DTOs.Projects;
using CollaborationSystem.Domain.Enums;

namespace CollaborationSystem.Application.DTOs.Suggestions;

/// <summary>
/// Vote state returned after vote changes.
/// </summary>
public sealed class VoteResponse
{
    /// <summary>
    /// Suggestion identifier.
    /// </summary>
    public Guid SuggestionId { get; set; }

    /// <summary>
    /// Current user's vote, if any.
    /// </summary>
    public VoteType? CurrentUserVote { get; set; }

    /// <summary>
    /// Current suggestion vote score.
    /// </summary>
    public int Score { get; set; }

    /// <summary>
    /// Current user's vote quota after the operation.
    /// </summary>
    public CurrentUserVoteQuotaResponse VoteQuota { get; set; } = new();
}
