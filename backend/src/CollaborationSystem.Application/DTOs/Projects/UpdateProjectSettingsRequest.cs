namespace CollaborationSystem.Application.DTOs.Projects;

public sealed class UpdateProjectSettingsRequest
{
    public int VotesPerUser { get; set; }

    public int VoteResetPeriodDays { get; set; }
}
