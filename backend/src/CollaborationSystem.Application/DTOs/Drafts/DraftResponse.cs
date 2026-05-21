using CollaborationSystem.Domain.Enums;
using System.Text.Json;

namespace CollaborationSystem.Application.DTOs.Drafts;

/// <summary>
/// Saved draft for a suggestion or comment.
/// </summary>
public sealed class DraftResponse
{
    /// <summary>
    /// Draft identifier.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Project that owns the draft.
    /// </summary>
    public Guid ProjectId { get; set; }

    /// <summary>
    /// Draft content type.
    /// </summary>
    public DraftType Type { get; set; }

    /// <summary>
    /// Draft payload stored as JSON.
    /// </summary>
    public JsonElement Payload { get; set; }

    /// <summary>
    /// Last update timestamp in UTC.
    /// </summary>
    public DateTime UpdatedAt { get; set; }
}
