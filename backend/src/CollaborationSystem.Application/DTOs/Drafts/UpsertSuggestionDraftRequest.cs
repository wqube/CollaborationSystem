namespace CollaborationSystem.Application.DTOs.Drafts;

/// <summary>
/// Payload for creating or updating a suggestion draft.
/// </summary>
public sealed class UpsertSuggestionDraftRequest
{
    /// <summary>
    /// Draft suggestion text.
    /// </summary>
    public string Text { get; set; } = string.Empty;
}
