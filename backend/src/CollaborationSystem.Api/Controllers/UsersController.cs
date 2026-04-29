using CollaborationSystem.Application.Abstractions;
using CollaborationSystem.Application.DTOs.Auth;
using CollaborationSystem.Application.DTOs.Suggestions;
using CollaborationSystem.Application.DTOs.Users;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CollaborationSystem.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/users")]
public class UsersController(
    ICurrentUserService currentUserService,
    IUserDirectoryService userDirectoryService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PagedResponse<UserListItemResponse>>> GetUsers(
        [FromQuery] GetUsersQuery query,
        CancellationToken cancellationToken)
    {
        var response = await userDirectoryService.GetUsersAsync(query, cancellationToken);

        return Ok(response);
    }

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
