using CollaborationSystem.Application.Abstractions;
using CollaborationSystem.Application.DTOs.Projects;
using CollaborationSystem.Application.DTOs.Suggestions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CollaborationSystem.Api.Controllers;

/// <summary>
/// Provides project listing, creation, details, and dashboard endpoints.
/// </summary>
[ApiController]
[Authorize]
[Route("api/v1/projects")]
public class ProjectsController(IProjectService projectService) : ControllerBase
{
    /// <summary>
    /// Returns a paged list of projects visible to the current user.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResponse<ProjectSummaryResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<PagedResponse<ProjectSummaryResponse>>> GetProjects(
        [FromQuery] GetProjectsQuery query,
        CancellationToken cancellationToken)
    {
        var response = await projectService.GetProjectsAsync(query, cancellationToken);

        return Ok(response);
    }

    /// <summary>
    /// Creates a project and adds the creator as an admin member.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ProjectSummaryResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ProjectSummaryResponse>> CreateProject(
        [FromBody] CreateProjectRequest request,
        CancellationToken cancellationToken)
    {
        var createdProject = await projectService.CreateProjectAsync(request, cancellationToken);

        return CreatedAtAction(nameof(GetProjectById), new { projectId = createdProject.Id }, createdProject);
    }

    /// <summary>
    /// Returns project details by project id.
    /// </summary>
    [HttpGet("{projectId:guid}")]
    [ProducesResponseType(typeof(ProjectDetailsResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ProjectDetailsResponse>> GetProjectById(
        Guid projectId,
        CancellationToken cancellationToken)
    {
        var result = await projectService.GetProjectByIdAsync(projectId, cancellationToken);

        return ToProjectActionResult(result);
    }

    /// <summary>
    /// Returns dashboard data for a project.
    /// </summary>
    [HttpGet("{projectId:guid}/dashboard")]
    [ProducesResponseType(typeof(ProjectDashboardResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ProjectDashboardResponse>> GetDashboard(
        Guid projectId,
        [FromQuery] GetProjectDashboardQuery query,
        CancellationToken cancellationToken)
    {
        var result = await projectService.GetProjectDashboardAsync(projectId, query, cancellationToken);

        return ToProjectActionResult(result);
    }

    /// <summary>
    /// Soft deletes a project.
    /// </summary>
    [HttpDelete("{projectId:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteProject(
        Guid projectId,
        CancellationToken cancellationToken)
    {
        var result = await projectService.DeleteProjectAsync(projectId, cancellationToken);

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

        return result.Status switch
        {
            ProjectOperationStatus.Forbidden => Forbid(),
            ProjectOperationStatus.ProjectNotFound => Problem(
                statusCode: StatusCodes.Status404NotFound,
                title: "Project not found."),
            _ => Problem(
                statusCode: StatusCodes.Status400BadRequest,
                title: "Project operation failed.")
        };
    }

    private ActionResult ToProjectErrorActionResult(ProjectOperationStatus status)
    {
        return status switch
        {
            ProjectOperationStatus.Forbidden => Forbid(),
            ProjectOperationStatus.ProjectNotFound => Problem(
                statusCode: StatusCodes.Status404NotFound,
                title: "Project not found."),
            _ => Problem(
                statusCode: StatusCodes.Status400BadRequest,
                title: "Project operation failed.")
        };
    }
}
