using CollaborationSystem.Application.Abstractions;
using CollaborationSystem.Application.Auth;
using CollaborationSystem.Application.DTOs;
using CollaborationSystem.Application.DTOs.Auth;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;

namespace CollaborationSystem.Api.Controllers;

/// <summary>
/// Provides authentication endpoints for development users.
/// </summary>
[ApiController]
[Route("api/v1/auth")]
public class AuthController(
    IDevUserStore devUserStore,
    IJwtTokenService jwtTokenService,
    IRefreshSessionStore refreshSessionStore,
    IConfiguration configuration) : ControllerBase
{
    private const string DefaultRefreshTokenCookieName = "refreshToken";
    private const string DefaultRefreshTokenCookiePath = "/api/v1/auth";

    /// <summary>
    /// Signs in a development user and sets a refresh token cookie.
    /// </summary>
    [HttpPost("login")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<AuthResponse>> Login(
        [FromBody] LoginRequest request,
        CancellationToken cancellationToken)
    {
        var user = await devUserStore.ValidateCredentialsAsync(
            request.Email,
            request.Password,
            cancellationToken);

        if (user is null)
        {
            return Unauthorized();
        }

        var accessToken = jwtTokenService.CreateAccessToken(user);
        var refreshToken = await refreshSessionStore.CreateSessionAsync(user.Id, cancellationToken);
        SetRefreshTokenCookie(refreshToken);

        var response = new AuthResponse
        {
            AccessToken = accessToken.Token,
            ExpiresIn = accessToken.ExpiresIn,
            User = ToUserDto(user)
        };

        return Ok(response);
    }

    /// <summary>
    /// Rotates the refresh token cookie and returns a new access token.
    /// </summary>
    [HttpPost("refresh")]
    [ProducesResponseType(typeof(RefreshResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<RefreshResponse>> Refresh(CancellationToken cancellationToken)
    {
        if (!Request.Cookies.TryGetValue(GetRefreshTokenCookieName(), out var refreshToken) ||
            string.IsNullOrWhiteSpace(refreshToken))
        {
            return Unauthorized();
        }

        var refreshSession = await refreshSessionStore.ConsumeSessionAsync(refreshToken, cancellationToken);

        if (refreshSession is null)
        {
            return Unauthorized();
        }

        var user = await devUserStore.FindByIdAsync(refreshSession.UserId, cancellationToken);

        if (user is null)
        {
            return Unauthorized();
        }

        var newAccessToken = jwtTokenService.CreateAccessToken(user);
        var newRefreshToken = await refreshSessionStore.CreateSessionAsync(user.Id, cancellationToken);
        SetRefreshTokenCookie(newRefreshToken);

        return Ok(new RefreshResponse
        {
            AccessToken = newAccessToken.Token,
            ExpiresIn = newAccessToken.ExpiresIn,
            User = ToUserDto(user)
        });
    }

    /// <summary>
    /// Revokes the current refresh session and clears the refresh token cookie.
    /// </summary>
    [HttpPost("logout")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Logout(CancellationToken cancellationToken)
    {
        if (Request.Cookies.TryGetValue(GetRefreshTokenCookieName(), out var refreshToken) &&
            !string.IsNullOrWhiteSpace(refreshToken))
        {
            await refreshSessionStore.RevokeSessionAsync(refreshToken, cancellationToken);
        }

        Response.Cookies.Delete(GetRefreshTokenCookieName(), CreateRefreshTokenCookieOptions());

        return NoContent();
    }

    private void SetRefreshTokenCookie(RefreshToken refreshToken)
    {
        var expires = new DateTimeOffset(refreshToken.ExpiresAtUtc, TimeSpan.Zero);

        Response.Cookies.Append(
            GetRefreshTokenCookieName(),
            refreshToken.Token,
            CreateRefreshTokenCookieOptions(expires));
    }

    private string GetRefreshTokenCookieName() =>
        configuration["Auth:RefreshTokenCookieName"] ?? DefaultRefreshTokenCookieName;

    private string GetRefreshTokenCookiePath() =>
        configuration["Auth:RefreshTokenCookiePath"] ?? DefaultRefreshTokenCookiePath;

    private CookieOptions CreateRefreshTokenCookieOptions(DateTimeOffset? expires = null) =>
        new()
        {
            HttpOnly = true,
            IsEssential = true,
            SameSite = SameSiteMode.Lax,
            Secure = GetRefreshTokenCookieSecure(),
            Path = GetRefreshTokenCookiePath(),
            Expires = expires
        };

    private bool GetRefreshTokenCookieSecure()
    {
        var configuredValue = configuration["Auth:RefreshTokenCookieSecure"];

        if (bool.TryParse(configuredValue, out var secure))
        {
            return secure;
        }

        return !HttpContext.Request.IsHttps ? false : true;
    }

    private static UserDto ToUserDto(DevUser user) =>
        new()
        {
            Id = user.Id,
            DisplayName = user.DisplayName,
            Email = user.Email
        };
}
