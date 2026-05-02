using CollaborationSystem.Application.Abstractions;
using CollaborationSystem.Application.DTOs.Auth;
using CollaborationSystem.Application.DTOs.Suggestions;
using CollaborationSystem.Application.DTOs.Users;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CollaborationSystem.Api.Controllers;

/// <summary>
/// Provides user directory and current-user endpoints.
/// </summary>
[ApiController]
[Authorize]
[Route("api/v1/users")]
public class UsersController(
    ICurrentUserService currentUserService,
    IUserDirectoryService userDirectoryService) : ControllerBase
{
    /// <summary>
    /// Returns a paged list of users.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResponse<UserListItemResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<PagedResponse<UserListItemResponse>>> GetUsers(
        [FromQuery] GetUsersQuery query,
        CancellationToken cancellationToken)
    {
        var response = await userDirectoryService.GetUsersAsync(query, cancellationToken);

        return Ok(response);
    }

    /// <summary>
    /// Returns the current authenticated user.
    /// </summary>
    [HttpGet("me")]
    [ProducesResponseType(typeof(CurrentUserResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
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
