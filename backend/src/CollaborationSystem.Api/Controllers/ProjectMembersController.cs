using CollaborationSystem.Application.Abstractions;
using CollaborationSystem.Application.DTOs.Projects;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CollaborationSystem.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/projects/{projectId:guid}/members")]
public class ProjectMembersController(IProjectMemberService projectMemberService) : ControllerBase
{
    [HttpPost]
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

    [HttpPatch("{userId:guid}")]
    public async Task<ActionResult<ProjectMemberResponse>> UpdateMemberRole(
        Guid projectId,
        Guid userId,
        [FromBody] UpdateProjectMemberRoleRequest request,
        CancellationToken cancellationToken)
    {
        var result = await projectMemberService.UpdateMemberRoleAsync(projectId, userId, request, cancellationToken);

        return ToMemberActionResult(result, member => Ok(member));
    }

    [HttpDelete("{userId:guid}")]
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
            ProjectMemberOperationStatus.ProjectNotFound => NotFound(CreateProblemDetails(
                StatusCodes.Status404NotFound,
                "Project not found.")),
            ProjectMemberOperationStatus.UserNotFound => NotFound(CreateProblemDetails(
                StatusCodes.Status404NotFound,
                "User not found.")),
            ProjectMemberOperationStatus.MemberAlreadyExists => Conflict(CreateProblemDetails(
                StatusCodes.Status409Conflict,
                "User is already a project member.")),
            ProjectMemberOperationStatus.MemberNotFound => NotFound(CreateProblemDetails(
                StatusCodes.Status404NotFound,
                "Project member not found.")),
            ProjectMemberOperationStatus.LastProjectAdmin => Conflict(CreateProblemDetails(
                StatusCodes.Status409Conflict,
                "Project must have at least one admin.")),
            _ => BadRequest(CreateProblemDetails(
                StatusCodes.Status400BadRequest,
                "Project member operation failed."))
        };

    private static ProblemDetails CreateProblemDetails(int status, string title) =>
        new()
        {
            Status = status,
            Title = title
        };
}
