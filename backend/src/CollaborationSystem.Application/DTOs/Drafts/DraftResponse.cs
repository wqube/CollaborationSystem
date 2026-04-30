using CollaborationSystem.Domain.Enums;

namespace CollaborationSystem.Application.DTOs.Drafts;

public sealed class DraftResponse
{
    public Guid Id { get; set; }

    public Guid ProjectId { get; set; }

    public Guid UserId { get; set; }

    public Guid? SuggestionId { get; set; }

    public Guid? ParentCommentId { get; set; }

    public DraftType Type { get; set; }

    public string PayloadJson { get; set; } = "{}";

    public DateTime CreatedAtUtc { get; set; }

    public DateTime UpdatedAtUtc { get; set; }
}
