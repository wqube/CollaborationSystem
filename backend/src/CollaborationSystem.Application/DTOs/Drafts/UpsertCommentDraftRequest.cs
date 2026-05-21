namespace CollaborationSystem.Application.DTOs.Drafts;

/// <summary>
/// Payload for creating or updating a comment draft.
/// </summary>
public sealed class UpsertCommentDraftRequest
{
    /// <summary>
    /// Suggestion that the draft comment belongs to.
    /// </summary>
    public Guid SuggestionId { get; set; }

    /// <summary>
    /// Optional parent comment for threaded replies.
    /// </summary>
    public Guid? ParentCommentId { get; set; }

    /// <summary>
    /// Draft comment text.
    /// </summary>
    public string Text { get; set; } = string.Empty;
}
