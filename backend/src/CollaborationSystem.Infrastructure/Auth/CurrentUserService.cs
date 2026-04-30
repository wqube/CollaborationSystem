using System.Security.Claims;
using CollaborationSystem.Application.Abstractions;
using Microsoft.AspNetCore.Http;

namespace CollaborationSystem.Infrastructure.Auth;

public sealed class CurrentUserService(IHttpContextAccessor httpContextAccessor) : ICurrentUserService
{
    public Guid GetRequiredUserId()
    {
        var user = httpContextAccessor.HttpContext?.User;

        if (user is null)
        {
            return Guid.Empty;
        }

        var candidateValues = new[]
        {
            user.FindFirstValue(ClaimTypes.NameIdentifier),
            user.FindFirstValue("sub"),
            user.FindFirstValue("nameid"),
            user.FindFirstValue("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")
        };

        foreach (var value in candidateValues)
        {
            if (Guid.TryParse(value, out var parsedUserId))
            {
                return parsedUserId;
            }
        }

        var guidFromAnyClaim = user.Claims
            .Select(x => x.Value)
            .FirstOrDefault(x => Guid.TryParse(x, out _));

        return Guid.TryParse(guidFromAnyClaim, out var fallbackUserId)
            ? fallbackUserId
            : Guid.Empty;
    }

    public string? GetDisplayName() =>
        httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.Name);

    public string? GetEmail() =>
        httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.Email);

    public string? GetAuthMode() =>
        httpContextAccessor.HttpContext?.User.FindFirstValue("auth_mode");
}
