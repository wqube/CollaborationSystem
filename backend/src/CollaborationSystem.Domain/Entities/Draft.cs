using CollaborationSystem.Domain.Common;
using CollaborationSystem.Domain.Enums;

namespace CollaborationSystem.Domain.Entities;

public class Draft : BaseEntity
{
    public Guid ProjectId { get; set; }
    public Guid UserId { get; set; }
    public Guid? SuggestionId { get; set; }
    public Guid? ParentCommentId { get; set; }
    public DraftType Type { get; set; }
    public string PayloadJson { get; set; } = "{}";

    public Project? Project { get; set; }
    public AppUser? User { get; set; }
    public Suggestion? Suggestion { get; set; }
    public Comment? ParentComment { get; set; }
}
