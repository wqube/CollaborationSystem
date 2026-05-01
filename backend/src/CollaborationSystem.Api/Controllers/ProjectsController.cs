using CollaborationSystem.Application.Abstractions;
using CollaborationSystem.Application.DTOs.Projects;
using CollaborationSystem.Application.DTOs.Suggestions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CollaborationSystem.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/projects")]
public class ProjectsController(IProjectService projectService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PagedResponse<ProjectSummaryResponse>>> GetProjects(
        [FromQuery] GetProjectsQuery query,
        CancellationToken cancellationToken)
    {
        var response = await projectService.GetProjectsAsync(query, cancellationToken);

        return Ok(response);
    }

    [HttpPost]
    public async Task<ActionResult<ProjectSummaryResponse>> CreateProject(
        [FromBody] CreateProjectRequest request,
        CancellationToken cancellationToken)
    {
        var createdProject = await projectService.CreateProjectAsync(request, cancellationToken);

        return CreatedAtAction(nameof(GetProjectById), new { projectId = createdProject.Id }, createdProject);
    }

    [HttpGet("{projectId:guid}")]
    public async Task<ActionResult<ProjectDetailsResponse>> GetProjectById(
        Guid projectId,
        CancellationToken cancellationToken)
    {
        var result = await projectService.GetProjectByIdAsync(projectId, cancellationToken);

        return ToProjectActionResult(result);
    }

    [HttpGet("{projectId:guid}/dashboard")]
    public async Task<ActionResult<ProjectDashboardResponse>> GetDashboard(
        Guid projectId,
        [FromQuery] GetProjectDashboardQuery query,
        CancellationToken cancellationToken)
    {
        var result = await projectService.GetProjectDashboardAsync(projectId, query, cancellationToken);

        return ToProjectActionResult(result);
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
            ProjectOperationStatus.ProjectNotFound => NotFound(CreateProblemDetails(
                StatusCodes.Status404NotFound,
                "Project not found.")),
            _ => BadRequest(CreateProblemDetails(
                StatusCodes.Status400BadRequest,
                "Project operation failed."))
        };
    }

    private static ProblemDetails CreateProblemDetails(int status, string title) =>
        new()
        {
            Status = status,
            Title = title
        };
}
