using CollaborationSystem.Domain.Enums;

namespace CollaborationSystem.Application.DTOs.Drafts;

/// <summary>
/// Query parameters for listing project drafts.
/// </summary>
public sealed class GetDraftsQuery
{
    /// <summary>
    /// Optional draft type filter.
    /// </summary>
    public DraftType? Type { get; set; }

    /// <summary>
    /// One-based page number.
    /// </summary>
    public int Page { get; set; } = 1;

    /// <summary>
    /// Number of drafts per page.
    /// </summary>
    public int PageSize { get; set; } = 10;
}
