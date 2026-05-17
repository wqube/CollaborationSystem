namespace CollaborationSystem.Application.DTOs.Suggestions;

/// <summary>
/// Payload for updating a comment.
/// </summary>
public sealed class UpdateCommentRequest
{
    /// <summary>
    /// New comment text.
    /// </summary>
    public string Text { get; set; } = string.Empty;
}
