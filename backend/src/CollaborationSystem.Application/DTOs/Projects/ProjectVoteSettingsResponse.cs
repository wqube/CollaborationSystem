namespace CollaborationSystem.Application.DTOs.Projects;

/// <summary>
/// Project vote quota settings.
/// </summary>
public sealed class ProjectVoteSettingsResponse
{
    /// <summary>
    /// Maximum votes each user can cast per reset period.
    /// </summary>
    public int VotesPerUser { get; set; }

    /// <summary>
    /// Number of days between vote quota resets.
    /// </summary>
    public int VoteResetPeriodDays { get; set; }
}
