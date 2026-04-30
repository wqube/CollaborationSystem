namespace CollaborationSystem.Application.DTOs.Suggestions;

public sealed class CommentResponse
{
    public Guid Id { get; set; }

    public Guid ProjectId { get; set; }

    public Guid SuggestionId { get; set; }

    public Guid? ParentCommentId { get; set; }

    public string Text { get; set; } = string.Empty;

    public SuggestionAuthorResponse Author { get; set; } = new();

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }
}
