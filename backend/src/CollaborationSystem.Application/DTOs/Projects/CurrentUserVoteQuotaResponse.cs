namespace CollaborationSystem.Application.DTOs.Projects;

public sealed class CurrentUserVoteQuotaResponse
{
    public int VotesLimit { get; set; }

    public int VotesRemaining { get; set; }

    public DateTime NextResetAt { get; set; }
}
