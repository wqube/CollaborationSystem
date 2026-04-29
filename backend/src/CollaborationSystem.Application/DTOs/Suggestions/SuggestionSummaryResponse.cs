using CollaborationSystem.Domain.Enums;

namespace CollaborationSystem.Application.DTOs.Suggestions;

public class SuggestionSummaryResponse
{
    public Guid Id { get; set; }

    public Guid ProjectId { get; set; }

    public string Text { get; set; } = string.Empty;

    public SuggestionStatus Status { get; set; }

    public SuggestionAuthorResponse Author { get; set; } = new();

    public int Score { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }
}
