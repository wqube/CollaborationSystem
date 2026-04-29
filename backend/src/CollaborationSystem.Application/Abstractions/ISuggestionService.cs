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
}
