using CollaborationSystem.Domain.Enums;

namespace CollaborationSystem.Application.DTOs.Suggestions;

public sealed class VoteRequest
{
    public VoteType VoteType { get; set; }
}
