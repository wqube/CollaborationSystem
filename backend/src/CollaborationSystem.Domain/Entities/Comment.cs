using CollaborationSystem.Domain.Common;

namespace CollaborationSystem.Domain.Entities;

public class Comment : BaseEntity
{
    public Guid ProjectId { get; set; }
    public Guid SuggestionId { get; set; }
    public Guid AuthorId { get; set; }
    public Guid? ParentCommentId { get; set; }
    public string Text { get; set; } = string.Empty;
    public DateTime? DeletedAtUtc { get; set; }

    public Project? Project { get; set; }
    public Suggestion? Suggestion { get; set; }
    public AppUser? Author { get; set; }
    public Comment? ParentComment { get; set; }
    public ICollection<Comment> Replies { get; set; } = [];
}
