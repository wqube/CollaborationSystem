using CollaborationSystem.Application.Abstractions;
using CollaborationSystem.Application.DTOs.Projects;
using CollaborationSystem.Application.DTOs.Suggestions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CollaborationSystem.Api.Controllers;

/// <summary>
/// Provides suggestion and vote endpoints for projects.
/// </summary>
[ApiController]
[Authorize]
[Route("api/v1/projects/{projectId:guid}/suggestions")]
public class SuggestionsController(ISuggestionService suggestionService) : ControllerBase
{
    /// <summary>
    /// Returns a filtered and paged list of project suggestions.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResponse<SuggestionSummaryResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<ActionResult<PagedResponse<SuggestionSummaryResponse>>> GetSuggestions(
        Guid projectId,
        [FromQuery] GetSuggestionsQuery query,
        CancellationToken cancellationToken)
    {
        var result = await suggestionService.GetSuggestionsAsync(projectId, query, cancellationToken);

        return ToActionResult(result, value => Ok(value));
    }

    /// <summary>
    /// Creates a suggestion in a project.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(SuggestionSummaryResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
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

    /// <summary>
    /// Returns suggestion details by suggestion id.
    /// </summary>
    [HttpGet("{suggestionId:guid}")]
    [ProducesResponseType(typeof(SuggestionDetailsResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<SuggestionDetailsResponse>> GetSuggestionById(
        Guid projectId,
        Guid suggestionId,
        CancellationToken cancellationToken)
    {
        var result = await suggestionService.GetSuggestionByIdAsync(projectId, suggestionId, cancellationToken);

        return ToActionResult(result, value => Ok(value));
    }

    /// <summary>
    /// Updates suggestion text.
    /// </summary>
    [HttpPatch("{suggestionId:guid}")]
    [ProducesResponseType(typeof(SuggestionSummaryResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
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

    /// <summary>
    /// Updates suggestion status.
    /// </summary>
    [HttpPatch("{suggestionId:guid}/status")]
    [ProducesResponseType(typeof(SuggestionSummaryResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
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

    /// <summary>
    /// Sets the current user's vote for a suggestion.
    /// </summary>
    [HttpPut("{suggestionId:guid}/vote")]
    [ProducesResponseType(typeof(VoteResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
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

    /// <summary>
    /// Removes the current user's vote from a suggestion.
    /// </summary>
    [HttpDelete("{suggestionId:guid}/vote")]
    [ProducesResponseType(typeof(VoteResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
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

        return ToErrorActionResult(result);
    }

    private ActionResult ToErrorActionResult<T>(SuggestionOperationResult<T> result) =>
        result.Status switch
        {
            SuggestionOperationStatus.Forbidden => Forbid(),
            SuggestionOperationStatus.ProjectNotFound => Problem(
                statusCode: StatusCodes.Status404NotFound,
                title: "Project not found."),
            SuggestionOperationStatus.SuggestionNotFound => Problem(
                statusCode: StatusCodes.Status404NotFound,
                title: "Suggestion not found."),
            SuggestionOperationStatus.UserNotFound => Problem(
                statusCode: StatusCodes.Status404NotFound,
                title: "User not found."),
            SuggestionOperationStatus.Conflict => Problem(
                statusCode: StatusCodes.Status409Conflict,
                title: "Suggestion operation conflicts with the current state."),
            SuggestionOperationStatus.VoteLimitExceeded => VoteLimitExceeded(result.ErrorDetails),
            SuggestionOperationStatus.InvalidRequest => Problem(
                statusCode: StatusCodes.Status400BadRequest,
                title: "Suggestion request is invalid."),
            _ => Problem(
                statusCode: StatusCodes.Status400BadRequest,
                title: "Suggestion operation failed.")
        };

    private ActionResult VoteLimitExceeded(object? errorDetails)
    {
        var problemDetails = new ProblemDetails
        {
            Status = StatusCodes.Status409Conflict,
            Title = "Vote limit exceeded."
        };

        problemDetails.Extensions["code"] = "VoteLimitExceeded";

        if (errorDetails is CurrentUserVoteQuotaResponse quota)
        {
            problemDetails.Extensions["nextResetAt"] = quota.NextResetAt;
            problemDetails.Extensions["voteQuota"] = quota;
        }

        return Conflict(problemDetails);
    }
}
