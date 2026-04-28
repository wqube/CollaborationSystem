using CollaborationSystem.Application.Abstractions;
using CollaborationSystem.Application.DTOs.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CollaborationSystem.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/users")]
public class UsersController(ICurrentUserService currentUserService) : ControllerBase
{
    [HttpGet("me")]
    public ActionResult<CurrentUserResponse> GetCurrentUser()
    {
        var userId = currentUserService.GetRequiredUserId();

        if (userId == Guid.Empty)
        {
            return Unauthorized();
        }

        return Ok(new CurrentUserResponse
        {
            Id = userId,
            DisplayName = currentUserService.GetDisplayName() ?? string.Empty,
            Email = currentUserService.GetEmail() ?? string.Empty,
            AuthMode = currentUserService.GetAuthMode() ?? "DevLogin"
        });
    }
}
