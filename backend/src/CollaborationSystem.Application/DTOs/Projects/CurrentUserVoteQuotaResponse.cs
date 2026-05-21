namespace CollaborationSystem.Application.DTOs.Projects;

/// <summary>
/// Current user's vote quota for a project.
/// </summary>
public sealed class CurrentUserVoteQuotaResponse
{
    /// <summary>
    /// Maximum number of votes available in the current reset period.
    /// </summary>
    public int VotesLimit { get; set; }

    /// <summary>
    /// Number of votes the current user can still cast.
    /// </summary>
    public int VotesRemaining { get; set; }

    /// <summary>
    /// Timestamp when the vote quota resets.
    /// </summary>
    public DateTime NextResetAt { get; set; }
}
