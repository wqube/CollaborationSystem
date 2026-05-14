using CollaborationSystem.Application.Abstractions;
using CollaborationSystem.Application.DTOs.Projects;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CollaborationSystem.Api.Controllers;

/// <summary>
/// Provides project member management endpoints.
/// </summary>
[ApiController]
[Authorize]
[Route("api/v1/projects/{projectId:guid}/members")]
public class ProjectMembersController(IProjectMemberService projectMemberService) : ControllerBase
{
    /// <summary>
    /// Adds a user as a project member.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ProjectMemberResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<ActionResult<ProjectMemberResponse>> AddMember(
        Guid projectId,
        [FromBody] AddProjectMemberRequest request,
        CancellationToken cancellationToken)
    {
        var result = await projectMemberService.AddMemberAsync(projectId, request, cancellationToken);

        return ToMemberActionResult(
            result,
            member => Created($"/api/v1/projects/{projectId}/members/{member.UserId}", member));
    }

    /// <summary>
    /// Updates a project member role.
    /// </summary>
    [HttpPatch("{userId:guid}")]
    [ProducesResponseType(typeof(ProjectMemberResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<ActionResult<ProjectMemberResponse>> UpdateMemberRole(
        Guid projectId,
        Guid userId,
        [FromBody] UpdateProjectMemberRoleRequest request,
        CancellationToken cancellationToken)
    {
        var result = await projectMemberService.UpdateMemberRoleAsync(projectId, userId, request, cancellationToken);

        return ToMemberActionResult(result, member => Ok(member));
    }

    /// <summary>
    /// Removes a user from project members.
    /// </summary>
    [HttpDelete("{userId:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RemoveMember(
        Guid projectId,
        Guid userId,
        CancellationToken cancellationToken)
    {
        var result = await projectMemberService.RemoveMemberAsync(projectId, userId, cancellationToken);

        return result.Status == ProjectMemberOperationStatus.Success
            ? NoContent()
            : ToErrorActionResult(result.Status);
    }

    private ActionResult<ProjectMemberResponse> ToMemberActionResult(
        ProjectMemberOperationResult result,
        Func<ProjectMemberResponse, ActionResult<ProjectMemberResponse>> onSuccess)
    {
        return result.Status == ProjectMemberOperationStatus.Success && result.Member is not null
            ? onSuccess(result.Member)
            : ToErrorActionResult(result.Status);
    }

    private ActionResult ToErrorActionResult(ProjectMemberOperationStatus status) =>
        status switch
        {
            ProjectMemberOperationStatus.Forbidden => Forbid(),
            ProjectMemberOperationStatus.ProjectNotFound => Problem(
                statusCode: StatusCodes.Status404NotFound,
                title: "Project not found."),
            ProjectMemberOperationStatus.UserNotFound => Problem(
                statusCode: StatusCodes.Status404NotFound,
                title: "User not found."),
            ProjectMemberOperationStatus.MemberAlreadyExists => Problem(
                statusCode: StatusCodes.Status409Conflict,
                title: "User is already a project member."),
            ProjectMemberOperationStatus.MemberNotFound => Problem(
                statusCode: StatusCodes.Status404NotFound,
                title: "Project member not found."),
            ProjectMemberOperationStatus.LastProjectAdmin => Problem(
                statusCode: StatusCodes.Status409Conflict,
                title: "Project must have at least one admin."),
            _ => Problem(
                statusCode: StatusCodes.Status400BadRequest,
                title: "Project member operation failed.")
        };
}
