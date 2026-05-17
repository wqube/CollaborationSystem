namespace CollaborationSystem.Application.DTOs.Projects;

public sealed class ProjectVoteSettingsResponse
{
    public int VotesPerUser { get; set; }

    public int VoteResetPeriodDays { get; set; }
}
