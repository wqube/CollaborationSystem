using CollaborationSystem.Application.DTOs.Suggestions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CollaborationSystem.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/projects/{projectId:guid}/suggestions")]
public class SuggestionsController : ControllerBase
{
    [HttpGet]
    public IActionResult GetSuggestions(Guid projectId)
    {
        return Ok(Array.Empty<object>());
    }

    [HttpPost]
    public IActionResult CreateSuggestion(Guid projectId, [FromBody] CreateSuggestionRequest request)
    {
        var suggestionId = Guid.NewGuid();

        return CreatedAtAction(nameof(GetSuggestionById), new { projectId, suggestionId }, new
        {
            id = suggestionId,
            projectId,
            request.Text,
            createdAt = DateTime.UtcNow
        });
    }

    [HttpGet("{suggestionId:guid}")]
    public IActionResult GetSuggestionById(Guid projectId, Guid suggestionId)
    {
        return Ok(new
        {
            id = suggestionId,
            projectId
        });
    }

    [HttpPut("{suggestionId:guid}/vote")]
    public IActionResult Vote(Guid projectId, Guid suggestionId, [FromBody] VoteRequest request)
    {
        return Ok(new
        {
            projectId,
            suggestionId,
            request.VoteType
        });
    }

    [HttpDelete("{suggestionId:guid}/vote")]
    public IActionResult RemoveVote(Guid projectId, Guid suggestionId)
    {
        return NoContent();
    }
}
