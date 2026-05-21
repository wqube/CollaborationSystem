using CollaborationSystem.Domain.Enums;

namespace CollaborationSystem.Application.DTOs.Suggestions;

/// <summary>
/// Payload for updating suggestion status.
/// </summary>
public sealed class UpdateSuggestionStatusRequest
{
    /// <summary>
    /// New suggestion status.
    /// </summary>
    public SuggestionStatus Status { get; set; }
}
