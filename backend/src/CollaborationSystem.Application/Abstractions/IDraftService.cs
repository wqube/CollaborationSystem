using CollaborationSystem.Application.DTOs.Drafts;
using CollaborationSystem.Application.DTOs.Suggestions;

namespace CollaborationSystem.Application.Abstractions;

public interface IDraftService
{
    Task<DraftOperationResult<PagedResponse<DraftResponse>>> GetDraftsAsync(
        Guid projectId,
        GetDraftsQuery query,
        CancellationToken cancellationToken = default);

    Task<DraftOperationResult<DraftResponse>> UpsertSuggestionDraftAsync(
        Guid projectId,
        Guid draftId,
        UpsertSuggestionDraftRequest request,
        CancellationToken cancellationToken = default);

    Task<DraftOperationResult<DraftResponse>> UpsertCommentDraftAsync(
        Guid projectId,
        Guid draftId,
        UpsertCommentDraftRequest request,
        CancellationToken cancellationToken = default);

    Task<DraftOperationResult<bool>> DeleteDraftAsync(
        Guid projectId,
        Guid draftId,
        CancellationToken cancellationToken = default);
}
