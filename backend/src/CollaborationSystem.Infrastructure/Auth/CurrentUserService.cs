using System.Security.Claims;
using CollaborationSystem.Application.Abstractions;
using Microsoft.AspNetCore.Http;

namespace CollaborationSystem.Infrastructure.Auth;

public sealed class CurrentUserService(IHttpContextAccessor httpContextAccessor) : ICurrentUserService
{
    public Guid GetRequiredUserId()
    {
        var userId = httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier);

        return Guid.TryParse(userId, out var parsedUserId)
            ? parsedUserId
            : Guid.Empty;
    }

    public string? GetDisplayName() =>
        httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.Name);

    public string? GetEmail() =>
        httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.Email);

    public string? GetAuthMode() =>
        httpContextAccessor.HttpContext?.User.FindFirstValue("auth_mode");
}
