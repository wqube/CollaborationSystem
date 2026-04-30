using CollaborationSystem.Domain.Enums;

namespace CollaborationSystem.Application.DTOs.Projects;

public sealed class SuggestionPreviewResponse
{
    public Guid Id { get; set; }

    public string Text { get; set; } = string.Empty;

    public SuggestionStatus Status { get; set; }

    public int Score { get; set; }

    public DateTime CreatedAtUtc { get; set; }
}
