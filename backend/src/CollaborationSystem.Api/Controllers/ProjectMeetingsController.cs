using CollaborationSystem.Application.Abstractions;
using CollaborationSystem.Application.DTOs.Projects;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CollaborationSystem.Api.Controllers;

/// <summary>
/// Provides manual project meeting schedule endpoints.
/// </summary>
[ApiController]
[Authorize]
[Route("api/v1/projects/{projectId:guid}/meetings")]
public class ProjectMeetingsController(IProjectMeetingService meetingService) : ControllerBase
{
    /// <summary>
    /// Returns manually scheduled meetings for a project.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<ProjectMeetingResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<IReadOnlyList<ProjectMeetingResponse>>> GetMeetings(
        Guid projectId,
        CancellationToken cancellationToken)
    {
        var result = await meetingService.GetMeetingsAsync(projectId, cancellationToken);

        return ToProjectActionResult(result);
    }

    /// <summary>
    /// Creates a manual project meeting. Only project admins can create meetings.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ProjectMeetingResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ProjectMeetingResponse>> CreateMeeting(
        Guid projectId,
        [FromBody] CreateProjectMeetingRequest request,
        CancellationToken cancellationToken)
    {
        var result = await meetingService.CreateMeetingAsync(projectId, request, cancellationToken);

        return result.Status == ProjectOperationStatus.Success && result.Value is not null
            ? Created($"/api/v1/projects/{projectId}/meetings/{result.Value.Id}", result.Value)
            : ToProjectErrorActionResult(result.Status);
    }

    /// <summary>
    /// Deletes a manually scheduled project meeting. Only project admins can delete meetings.
    /// </summary>
    [HttpDelete("{meetingId:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteMeeting(
        Guid projectId,
        Guid meetingId,
        CancellationToken cancellationToken)
    {
        var result = await meetingService.DeleteMeetingAsync(projectId, meetingId, cancellationToken);

        return result.Status == ProjectOperationStatus.Success
            ? NoContent()
            : ToProjectErrorActionResult(result.Status);
    }

    private ActionResult<T> ToProjectActionResult<T>(ProjectOperationResult<T> result)
    {
        if (result.Status == ProjectOperationStatus.Success && result.Value is not null)
        {
            return Ok(result.Value);
        }

        return ToProjectErrorActionResult(result.Status);
    }

    private ActionResult ToProjectErrorActionResult(ProjectOperationStatus status) =>
        status switch
        {
            ProjectOperationStatus.Forbidden => Forbid(),
            ProjectOperationStatus.ProjectNotFound => Problem(
                statusCode: StatusCodes.Status404NotFound,
                title: "Project not found."),
            ProjectOperationStatus.ProjectMeetingNotFound => Problem(
                statusCode: StatusCodes.Status404NotFound,
                title: "Project meeting not found."),
            _ => Problem(
                statusCode: StatusCodes.Status400BadRequest,
                title: "Project meeting operation failed.")
        };
}
