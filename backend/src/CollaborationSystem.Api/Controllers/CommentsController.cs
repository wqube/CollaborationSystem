using CollaborationSystem.Application.Abstractions;
using CollaborationSystem.Application.DTOs.Suggestions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CollaborationSystem.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/projects/{projectId:guid}")]
public class CommentsController(ISuggestionService suggestionService) : ControllerBase
{
    [HttpGet("suggestions/{suggestionId:guid}/comments")]
    public async Task<ActionResult<IReadOnlyList<CommentResponse>>> GetComments(
        Guid projectId,
        Guid suggestionId,
        CancellationToken cancellationToken)
    {
        var result = await suggestionService.GetCommentsAsync(projectId, suggestionId, cancellationToken);

        return ToActionResult(result, value => Ok(value));
    }

    [HttpPost("suggestions/{suggestionId:guid}/comments")]
    public async Task<ActionResult<CommentResponse>> CreateComment(
        Guid projectId,
        Guid suggestionId,
        [FromBody] CreateCommentRequest request,
        CancellationToken cancellationToken)
    {
        var result = await suggestionService.CreateCommentAsync(projectId, suggestionId, request, cancellationToken);

        return ToActionResult(
            result,
            comment => Created(
                $"/api/v1/projects/{projectId}/comments/{comment.Id}",
                comment));
    }

    [HttpPatch("comments/{commentId:guid}")]
    public async Task<ActionResult<CommentResponse>> UpdateComment(
        Guid projectId,
        Guid commentId,
        [FromBody] UpdateCommentRequest request,
        CancellationToken cancellationToken)
    {
        var result = await suggestionService.UpdateCommentAsync(projectId, commentId, request, cancellationToken);

        return ToActionResult(result, value => Ok(value));
    }

    [HttpDelete("comments/{commentId:guid}")]
    public async Task<IActionResult> DeleteComment(
        Guid projectId,
        Guid commentId,
        CancellationToken cancellationToken)
    {
        var result = await suggestionService.DeleteCommentAsync(projectId, commentId, cancellationToken);

        return result.Status == SuggestionOperationStatus.Success
            ? NoContent()
            : ToErrorActionResult(result.Status);
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
            SuggestionOperationStatus.CommentNotFound => NotFound(CreateProblemDetails(
                StatusCodes.Status404NotFound,
                "Comment not found.")),
            SuggestionOperationStatus.InvalidRequest => BadRequest(CreateProblemDetails(
                StatusCodes.Status400BadRequest,
                "Comment request is invalid.")),
            _ => BadRequest(CreateProblemDetails(
                StatusCodes.Status400BadRequest,
                "Comment operation failed."))
        };

    private static ProblemDetails CreateProblemDetails(int status, string title) =>
        new()
        {
            Status = status,
            Title = title
        };
}
