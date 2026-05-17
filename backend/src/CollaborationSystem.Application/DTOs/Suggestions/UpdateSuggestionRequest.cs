namespace CollaborationSystem.Application.DTOs.Suggestions;

/// <summary>
/// Payload for updating suggestion text.
/// </summary>
public sealed class UpdateSuggestionRequest
{
    /// <summary>
    /// New suggestion text.
    /// </summary>
    public string Text { get; set; } = string.Empty;
}
