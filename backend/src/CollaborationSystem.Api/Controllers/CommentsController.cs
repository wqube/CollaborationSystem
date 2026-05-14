using CollaborationSystem.Application.Abstractions;
using CollaborationSystem.Application.DTOs.Suggestions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CollaborationSystem.Api.Controllers;

/// <summary>
/// Provides comment endpoints for project suggestions.
/// </summary>
[ApiController]
[Authorize]
[Route("api/v1/projects/{projectId:guid}")]
public class CommentsController(ISuggestionService suggestionService) : ControllerBase
{
    /// <summary>
    /// Returns comments for a suggestion.
    /// </summary>
    [HttpGet("suggestions/{suggestionId:guid}/comments")]
    [ProducesResponseType(typeof(IReadOnlyList<CommentResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<IReadOnlyList<CommentResponse>>> GetComments(
        Guid projectId,
        Guid suggestionId,
        CancellationToken cancellationToken)
    {
        var result = await suggestionService.GetCommentsAsync(projectId, suggestionId, cancellationToken);

        return ToActionResult(result, value => Ok(value));
    }

    /// <summary>
    /// Creates a comment for a suggestion.
    /// </summary>
    [HttpPost("suggestions/{suggestionId:guid}/comments")]
    [ProducesResponseType(typeof(CommentResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
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

    /// <summary>
    /// Updates a comment.
    /// </summary>
    [HttpPatch("comments/{commentId:guid}")]
    [ProducesResponseType(typeof(CommentResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CommentResponse>> UpdateComment(
        Guid projectId,
        Guid commentId,
        [FromBody] UpdateCommentRequest request,
        CancellationToken cancellationToken)
    {
        var result = await suggestionService.UpdateCommentAsync(projectId, commentId, request, cancellationToken);

        return ToActionResult(result, value => Ok(value));
    }

    /// <summary>
    /// Deletes a comment.
    /// </summary>
    [HttpDelete("comments/{commentId:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
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
            SuggestionOperationStatus.ProjectNotFound => Problem(
                statusCode: StatusCodes.Status404NotFound,
                title: "Project not found."),
            SuggestionOperationStatus.SuggestionNotFound => Problem(
                statusCode: StatusCodes.Status404NotFound,
                title: "Suggestion not found."),
            SuggestionOperationStatus.CommentNotFound => Problem(
                statusCode: StatusCodes.Status404NotFound,
                title: "Comment not found."),
            SuggestionOperationStatus.InvalidRequest => Problem(
                statusCode: StatusCodes.Status400BadRequest,
                title: "Comment request is invalid."),
            _ => Problem(
                statusCode: StatusCodes.Status400BadRequest,
                title: "Comment operation failed.")
        };
}
