using CollaborationSystem.Domain.Enums;

namespace CollaborationSystem.Application.DTOs.Suggestions;

public sealed class UpdateSuggestionStatusRequest
{
    public SuggestionStatus Status { get; set; }
}
