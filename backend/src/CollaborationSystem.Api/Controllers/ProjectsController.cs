using CollaborationSystem.Application.DTOs.Projects;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CollaborationSystem.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/projects")]
public class ProjectsController : ControllerBase
{
    [HttpGet]
    public IActionResult GetProjects()
    {
        return Ok(Array.Empty<object>());
    }

    [HttpPost]
    public IActionResult CreateProject([FromBody] CreateProjectRequest request)
    {
        var projectId = Guid.NewGuid();

        return CreatedAtAction(nameof(GetProjectById), new { projectId }, new
        {
            id = projectId,
            request.Name,
            request.Description,
            createdAt = DateTime.UtcNow
        });
    }

    [HttpGet("{projectId:guid}")]
    public IActionResult GetProjectById(Guid projectId)
    {
        return Ok(new
        {
            id = projectId
        });
    }
}
