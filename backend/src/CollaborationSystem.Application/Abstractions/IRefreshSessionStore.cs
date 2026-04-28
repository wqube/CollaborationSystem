using CollaborationSystem.Application.Auth;

namespace CollaborationSystem.Application.Abstractions;

public interface IRefreshSessionStore
{
    Task<RefreshToken> CreateSessionAsync(
        Guid userId,
        CancellationToken cancellationToken = default);

    Task<RefreshSession?> ConsumeSessionAsync(
        string refreshToken,
        CancellationToken cancellationToken = default);

    Task RevokeSessionAsync(
        string refreshToken,
        CancellationToken cancellationToken = default);
}
