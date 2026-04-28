using CollaborationSystem.Application.DTOs;
using CollaborationSystem.Application.DTOs.Auth;
using Microsoft.AspNetCore.Mvc;

namespace CollaborationSystem.Api.Controllers;

[ApiController]
[Route("api/v1/auth")]
public class AuthController : ControllerBase
{
    [HttpPost("login")]
    public ActionResult<AuthResponse> Login([FromBody] LoginRequest request)
    {
        var response = new AuthResponse
        {
            AccessToken = "dev-access-token",
            RefreshToken = "dev-refresh-token",
            ExpiresIn = 3600,
            User = new UserDto
            {
                Id = Guid.NewGuid(),
                DisplayName = "Demo User",
                Email = request.Email
            }
        };
        return Ok(response);
    }

    [HttpPost("refresh")]
    public IActionResult Refresh([FromBody] RefreshTokenRequest request)
    {
        return Ok(new
        {
            accessToken = "new-dev-access-token",
            refreshToken = request.RefreshToken
        });
    }

    [HttpPost("logout")]
    public IActionResult Logout()
    {
        return NoContent();
    }
}