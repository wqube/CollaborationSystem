using System.Text.Json;

namespace CollaborationSystem.Application.DTOs.Drafts;

public sealed class UpsertCommentDraftRequest
{
    public Guid? SuggestionId { get; set; }

    public Guid? ParentCommentId { get; set; }

    public JsonElement Payload { get; set; }
}
