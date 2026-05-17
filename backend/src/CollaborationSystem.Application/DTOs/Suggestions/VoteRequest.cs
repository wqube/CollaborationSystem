using CollaborationSystem.Domain.Enums;

namespace CollaborationSystem.Application.DTOs.Suggestions;

/// <summary>
/// Payload for setting the current user's vote.
/// </summary>
public sealed class VoteRequest
{
    /// <summary>
    /// Vote value to set.
    /// </summary>
    public VoteType VoteType { get; set; }
}
