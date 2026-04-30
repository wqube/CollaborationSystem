using CollaborationSystem.Application.Auth;

namespace CollaborationSystem.Application.Abstractions;

public interface IJwtTokenService
{
    AccessToken CreateAccessToken(DevUser user);
}
