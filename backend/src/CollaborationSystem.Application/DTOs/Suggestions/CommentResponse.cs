namespace CollaborationSystem.Application.DTOs.Suggestions;

/// <summary>
/// Comment data for a project suggestion.
/// </summary>
public sealed class CommentResponse
{
    /// <summary>
    /// Comment identifier.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Project that owns the comment.
    /// </summary>
    public Guid ProjectId { get; set; }

    /// <summary>
    /// Suggestion that owns the comment.
    /// </summary>
    public Guid SuggestionId { get; set; }

    /// <summary>
    /// Parent comment identifier for threaded replies.
    /// </summary>
    public Guid? ParentCommentId { get; set; }

    /// <summary>
    /// Comment text.
    /// </summary>
    public string Text { get; set; } = string.Empty;

    /// <summary>
    /// Comment author.
    /// </summary>
    public SuggestionAuthorResponse Author { get; set; } = new();

    /// <summary>
    /// Comment creation timestamp in UTC.
    /// </summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// Comment update timestamp in UTC.
    /// </summary>
    public DateTime UpdatedAt { get; set; }
}
