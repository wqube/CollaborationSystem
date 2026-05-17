namespace CollaborationSystem.Application.DTOs.Suggestions;

/// <summary>
/// Payload for creating a comment.
/// </summary>
public sealed class CreateCommentRequest
{
    /// <summary>
    /// Comment text.
    /// </summary>
    public string Text { get; set; } = string.Empty;

    /// <summary>
    /// Optional parent comment identifier for a reply.
    /// </summary>
    public Guid? ParentCommentId { get; set; }
}
