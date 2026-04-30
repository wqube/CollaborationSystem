using CollaborationSystem.Application.Abstractions;
using CollaborationSystem.Application.DTOs.Suggestions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CollaborationSystem.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/projects/{projectId:guid}/suggestions")]
public class SuggestionsController(ISuggestionService suggestionService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PagedResponse<SuggestionSummaryResponse>>> GetSuggestions(
        Guid projectId,
        [FromQuery] GetSuggestionsQuery query,
        CancellationToken cancellationToken)
    {
        var result = await suggestionService.GetSuggestionsAsync(projectId, query, cancellationToken);

        return ToActionResult(result, value => Ok(value));
    }

    [HttpPost]
    public async Task<ActionResult<SuggestionSummaryResponse>> CreateSuggestion(
        Guid projectId,
        [FromBody] CreateSuggestionRequest request,
        CancellationToken cancellationToken)
    {
        var result = await suggestionService.CreateSuggestionAsync(projectId, request, cancellationToken);

        return ToActionResult(
            result,
            suggestion => CreatedAtAction(
                nameof(GetSuggestionById),
                new { projectId, suggestionId = suggestion.Id },
                suggestion));
    }

    [HttpGet("{suggestionId:guid}")]
    public async Task<ActionResult<SuggestionDetailsResponse>> GetSuggestionById(
        Guid projectId,
        Guid suggestionId,
        CancellationToken cancellationToken)
    {
        var result = await suggestionService.GetSuggestionByIdAsync(projectId, suggestionId, cancellationToken);

        return ToActionResult(result, value => Ok(value));
    }

    [HttpPatch("{suggestionId:guid}")]
    public async Task<ActionResult<SuggestionSummaryResponse>> UpdateSuggestionText(
        Guid projectId,
        Guid suggestionId,
        [FromBody] UpdateSuggestionRequest request,
        CancellationToken cancellationToken)
    {
        var result = await suggestionService.UpdateSuggestionTextAsync(
            projectId,
            suggestionId,
            request,
            cancellationToken);

        return ToActionResult(result, value => Ok(value));
    }

    [HttpPatch("{suggestionId:guid}/status")]
    public async Task<ActionResult<SuggestionSummaryResponse>> UpdateSuggestionStatus(
        Guid projectId,
        Guid suggestionId,
        [FromBody] UpdateSuggestionStatusRequest request,
        CancellationToken cancellationToken)
    {
        var result = await suggestionService.UpdateSuggestionStatusAsync(
            projectId,
            suggestionId,
            request,
            cancellationToken);

        return ToActionResult(result, value => Ok(value));
    }

    [HttpPut("{suggestionId:guid}/vote")]
    public async Task<ActionResult<VoteResponse>> Vote(
        Guid projectId,
        Guid suggestionId,
        [FromBody] VoteRequest request,
        CancellationToken cancellationToken)
    {
        var result = await suggestionService.SetVoteAsync(
            projectId,
            suggestionId,
            request,
            cancellationToken);

        return ToActionResult(result, value => Ok(value));
    }

    [HttpDelete("{suggestionId:guid}/vote")]
    public async Task<ActionResult<VoteResponse>> RemoveVote(
        Guid projectId,
        Guid suggestionId,
        CancellationToken cancellationToken)
    {
        var result = await suggestionService.RemoveVoteAsync(projectId, suggestionId, cancellationToken);

        return ToActionResult(result, value => Ok(value));
    }

    private ActionResult<T> ToActionResult<T>(
        SuggestionOperationResult<T> result,
        Func<T, ActionResult<T>> onSuccess)
    {
        if (result.Status == SuggestionOperationStatus.Success && result.Value is not null)
        {
            return onSuccess(result.Value);
        }

        return ToErrorActionResult(result.Status);
    }

    private ActionResult ToErrorActionResult(SuggestionOperationStatus status) =>
        status switch
        {
            SuggestionOperationStatus.Forbidden => Forbid(),
            SuggestionOperationStatus.ProjectNotFound => NotFound(CreateProblemDetails(
                StatusCodes.Status404NotFound,
                "Project not found.")),
            SuggestionOperationStatus.SuggestionNotFound => NotFound(CreateProblemDetails(
                StatusCodes.Status404NotFound,
                "Suggestion not found.")),
            SuggestionOperationStatus.UserNotFound => NotFound(CreateProblemDetails(
                StatusCodes.Status404NotFound,
                "User not found.")),
            SuggestionOperationStatus.Conflict => Conflict(CreateProblemDetails(
                StatusCodes.Status409Conflict,
                "Suggestion operation conflicts with the current state.")),
            SuggestionOperationStatus.InvalidRequest => BadRequest(CreateProblemDetails(
                StatusCodes.Status400BadRequest,
                "Suggestion request is invalid.")),
            _ => BadRequest(CreateProblemDetails(
                StatusCodes.Status400BadRequest,
                "Suggestion operation failed."))
        };

    private static ProblemDetails CreateProblemDetails(int status, string title) =>
        new()
        {
            Status = status,
            Title = title
        };
}
