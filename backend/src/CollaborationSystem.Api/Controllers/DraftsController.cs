using CollaborationSystem.Application.Abstractions;
using CollaborationSystem.Application.DTOs.Drafts;
using CollaborationSystem.Application.DTOs.Suggestions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CollaborationSystem.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/projects/{projectId:guid}/drafts")]
public class DraftsController(IDraftService draftService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PagedResponse<DraftResponse>>> GetDrafts(
        Guid projectId,
        [FromQuery] GetDraftsQuery query,
        CancellationToken cancellationToken)
    {
        var result = await draftService.GetDraftsAsync(projectId, query, cancellationToken);
        return ToActionResult(result, value => Ok(value));
    }

    [HttpPut("suggestion/{draftId:guid}")]
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

    [HttpPut("comment/{draftId:guid}")]
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

    [HttpDelete("{draftId:guid}")]
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
            DraftOperationStatus.ProjectNotFound => NotFound(CreateProblemDetails(
                StatusCodes.Status404NotFound,
                "Project not found.")),
            DraftOperationStatus.DraftNotFound => NotFound(CreateProblemDetails(
                StatusCodes.Status404NotFound,
                "Draft not found.")),
            DraftOperationStatus.InvalidRequest => BadRequest(CreateProblemDetails(
                StatusCodes.Status400BadRequest,
                "Draft request is invalid.")),
            _ => BadRequest(CreateProblemDetails(
                StatusCodes.Status400BadRequest,
                "Draft operation failed."))
        };

    private static ProblemDetails CreateProblemDetails(int status, string title) =>
        new()
        {
            Status = status,
            Title = title
        };
}
