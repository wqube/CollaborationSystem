using CollaborationSystem.Domain.Enums;

namespace CollaborationSystem.Application.DTOs.Suggestions;

/// <summary>
/// A single user's vote in the suggestion vote breakdown.
/// </summary>
public sealed class VoteBreakdownItemResponse
{
    /// <summary>
    /// Voter user identifier.
    /// </summary>
    public Guid UserId { get; set; }

    /// <summary>
    /// Voter display name.
    /// </summary>
    public string DisplayName { get; set; } = string.Empty;

    /// <summary>
    /// Vote value.
    /// </summary>
    public VoteType VoteType { get; set; }

    /// <summary>
    /// Vote creation timestamp in UTC.
    /// </summary>
    public DateTime CreatedAt { get; set; }
}
