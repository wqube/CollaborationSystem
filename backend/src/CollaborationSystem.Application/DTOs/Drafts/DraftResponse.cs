using CollaborationSystem.Domain.Enums;
using System.Text.Json;

namespace CollaborationSystem.Application.DTOs.Drafts;

public sealed class DraftResponse
{
    public Guid Id { get; set; }

    public Guid ProjectId { get; set; }

    public DraftType Type { get; set; }

    public JsonElement Payload { get; set; }

    public DateTime UpdatedAt { get; set; }
}
