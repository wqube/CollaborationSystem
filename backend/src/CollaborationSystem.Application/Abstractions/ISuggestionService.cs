using CollaborationSystem.Application.DTOs.Suggestions;

namespace CollaborationSystem.Application.Abstractions;

public interface ISuggestionService
{
    Task<SuggestionOperationResult<PagedResponse<SuggestionSummaryResponse>>> GetSuggestionsAsync(
        Guid projectId,
        GetSuggestionsQuery query,
        CancellationToken cancellationToken = default);

    Task<SuggestionOperationResult<SuggestionSummaryResponse>> CreateSuggestionAsync(
        Guid projectId,
        CreateSuggestionRequest request,
        CancellationToken cancellationToken = default);

    Task<SuggestionOperationResult<SuggestionDetailsResponse>> GetSuggestionByIdAsync(
        Guid projectId,
        Guid suggestionId,
        CancellationToken cancellationToken = default);

    Task<SuggestionOperationResult<SuggestionSummaryResponse>> UpdateSuggestionTextAsync(
        Guid projectId,
        Guid suggestionId,
        UpdateSuggestionRequest request,
        CancellationToken cancellationToken = default);

    Task<SuggestionOperationResult<SuggestionSummaryResponse>> UpdateSuggestionStatusAsync(
        Guid projectId,
        Guid suggestionId,
        UpdateSuggestionStatusRequest request,
        CancellationToken cancellationToken = default);

    Task<SuggestionOperationResult<VoteResponse>> SetVoteAsync(
        Guid projectId,
        Guid suggestionId,
        VoteRequest request,
        CancellationToken cancellationToken = default);

    Task<SuggestionOperationResult<VoteResponse>> RemoveVoteAsync(
        Guid projectId,
        Guid suggestionId,
        CancellationToken cancellationToken = default);

    Task<SuggestionOperationResult<IReadOnlyList<CommentResponse>>> GetCommentsAsync(
        Guid projectId,
        Guid suggestionId,
        CancellationToken cancellationToken = default);

    Task<SuggestionOperationResult<CommentResponse>> CreateCommentAsync(
        Guid projectId,
        Guid suggestionId,
        CreateCommentRequest request,
        CancellationToken cancellationToken = default);

    Task<SuggestionOperationResult<CommentResponse>> UpdateCommentAsync(
        Guid projectId,
        Guid commentId,
        UpdateCommentRequest request,
        CancellationToken cancellationToken = default);

    Task<SuggestionOperationResult<bool>> DeleteCommentAsync(
        Guid projectId,
        Guid commentId,
        CancellationToken cancellationToken = default);
}
