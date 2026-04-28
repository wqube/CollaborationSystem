using CollaborationSystem.Application.DTOs;
using CollaborationSystem.Application.DTOs.Auth;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;

namespace CollaborationSystem.Api.Controllers;

[ApiController]
[Route("api/v1/auth")]
public class AuthController : ControllerBase
{
    private const string RefreshTokenCookieName = "refreshToken";
    private const int RefreshTokenLifetimeDays = 7;

    [HttpPost("login")]
    public ActionResult<AuthResponse> Login([FromBody] LoginRequest request)
    {
        SetRefreshTokenCookie("dev-refresh-token");

        var response = new AuthResponse
        {
            AccessToken = "dev-access-token",
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
    public ActionResult<RefreshResponse> Refresh()
    {
        if (!Request.Cookies.TryGetValue(RefreshTokenCookieName, out var refreshToken) ||
            string.IsNullOrWhiteSpace(refreshToken))
        {
            return Unauthorized();
        }

        SetRefreshTokenCookie("new-dev-refresh-token");

        return Ok(new RefreshResponse
        {
            AccessToken = "new-dev-access-token",
            ExpiresIn = 3600
        });
    }

    [HttpPost("logout")]
    public IActionResult Logout()
    {
        Response.Cookies.Delete(RefreshTokenCookieName, new CookieOptions
        {
            HttpOnly = true,
            IsEssential = true,
            SameSite = SameSiteMode.Lax,
            Secure = Request.IsHttps
        });

        return NoContent();
    }

    private void SetRefreshTokenCookie(string refreshToken)
    {
        Response.Cookies.Append(RefreshTokenCookieName, refreshToken, new CookieOptions
        {
            HttpOnly = true,
            IsEssential = true,
            SameSite = SameSiteMode.Lax,
            Secure = Request.IsHttps,
            Expires = DateTimeOffset.UtcNow.AddDays(RefreshTokenLifetimeDays)
        });
    }
}
