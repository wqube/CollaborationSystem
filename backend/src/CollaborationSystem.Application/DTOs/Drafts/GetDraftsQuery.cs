using CollaborationSystem.Domain.Enums;

namespace CollaborationSystem.Application.DTOs.Drafts;

public sealed class GetDraftsQuery
{
    public DraftType? Type { get; set; }

    public int Page { get; set; } = 1;

    public int PageSize { get; set; } = 10;
}
