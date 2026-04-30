namespace CollaborationSystem.Application.DTOs.Suggestions;

public sealed class CreateCommentRequest
{
    public string Text { get; set; } = string.Empty;

    public Guid? ParentCommentId { get; set; }
}
