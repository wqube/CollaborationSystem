namespace CollaborationSystem.Application.DTOs.Suggestions;

/// <summary>
/// Payload for creating a suggestion.
/// </summary>
public sealed class CreateSuggestionRequest
{
    /// <summary>
    /// Suggestion text.
    /// </summary>
    public string Text { get; set; } = string.Empty;
}
