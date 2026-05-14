using CollaborationSystem.Application.Abstractions;
using CollaborationSystem.Application.DTOs.Drafts;
using CollaborationSystem.Application.DTOs.Suggestions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CollaborationSystem.Api.Controllers;

/// <summary>
/// Provides draft endpoints for project suggestions and comments.
/// </summary>
[ApiController]
[Authorize]
[Route("api/v1/projects/{projectId:guid}/drafts")]
public class DraftsController(IDraftService draftService) : ControllerBase
{
    /// <summary>
    /// Returns a filtered and paged list of drafts.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResponse<DraftResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<PagedResponse<DraftResponse>>> GetDrafts(
        Guid projectId,
        [FromQuery] GetDraftsQuery query,
        CancellationToken cancellationToken)
    {
        var result = await draftService.GetDraftsAsync(projectId, query, cancellationToken);
        return ToActionResult(result, value => Ok(value));
    }

    /// <summary>
    /// Creates or updates a suggestion draft.
    /// </summary>
    [HttpPut("suggestion/{draftId:guid}")]
    [ProducesResponseType(typeof(DraftResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<DraftResponse>> UpsertSuggestionDraft(
        Guid projectId,
        Guid draftId,
        [FromBody] UpsertSuggestionDraftRequest request,
        CancellationToken cancellationToken)
    {
        var result = await draftService.UpsertSuggestionDraftAsync(
            projectId,
            draftId,
            request,
            cancellationToken);

        return ToActionResult(result, value => Ok(value));
    }

    /// <summary>
    /// Creates or updates a comment draft.
    /// </summary>
    [HttpPut("comment/{draftId:guid}")]
    [ProducesResponseType(typeof(DraftResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<DraftResponse>> UpsertCommentDraft(
        Guid projectId,
        Guid draftId,
        [FromBody] UpsertCommentDraftRequest request,
        CancellationToken cancellationToken)
    {
        var result = await draftService.UpsertCommentDraftAsync(
            projectId,
            draftId,
            request,
            cancellationToken);

        return ToActionResult(result, value => Ok(value));
    }

    /// <summary>
    /// Deletes a draft.
    /// </summary>
    [HttpDelete("{draftId:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteDraft(
        Guid projectId,
        Guid draftId,
        CancellationToken cancellationToken)
    {
        var result = await draftService.DeleteDraftAsync(projectId, draftId, cancellationToken);

        if (result.Status == DraftOperationStatus.Success)
        {
            return NoContent();
        }

        return ToErrorActionResult(result.Status);
    }

    private ActionResult<T> ToActionResult<T>(
        DraftOperationResult<T> result,
        Func<T, ActionResult<T>> onSuccess)
    {
        if (result.Status == DraftOperationStatus.Success && result.Value is not null)
        {
            return onSuccess(result.Value);
        }

        return ToErrorActionResult(result.Status);
    }

    private ActionResult ToErrorActionResult(DraftOperationStatus status) =>
        status switch
        {
            DraftOperationStatus.Forbidden => Forbid(),
            DraftOperationStatus.ProjectNotFound => Problem(
                statusCode: StatusCodes.Status404NotFound,
                title: "Project not found."),
            DraftOperationStatus.DraftNotFound => Problem(
                statusCode: StatusCodes.Status404NotFound,
                title: "Draft not found."),
            DraftOperationStatus.InvalidRequest => Problem(
                statusCode: StatusCodes.Status400BadRequest,
                title: "Draft request is invalid."),
            _ => Problem(
                statusCode: StatusCodes.Status400BadRequest,
                title: "Draft operation failed.")
        };
}
