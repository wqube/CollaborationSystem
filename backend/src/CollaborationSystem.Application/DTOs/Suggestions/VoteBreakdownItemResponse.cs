using CollaborationSystem.Domain.Enums;

namespace CollaborationSystem.Application.DTOs.Suggestions;

public sealed class VoteBreakdownItemResponse
{
    public Guid UserId { get; set; }

    public string DisplayName { get; set; } = string.Empty;

    public VoteType VoteType { get; set; }

    public DateTime CreatedAt { get; set; }
}
