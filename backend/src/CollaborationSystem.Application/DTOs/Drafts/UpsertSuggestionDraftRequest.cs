using System.Text.Json;

namespace CollaborationSystem.Application.DTOs.Drafts;

public sealed class UpsertSuggestionDraftRequest
{
    public Guid? SuggestionId { get; set; }

    public JsonElement Payload { get; set; }
}
