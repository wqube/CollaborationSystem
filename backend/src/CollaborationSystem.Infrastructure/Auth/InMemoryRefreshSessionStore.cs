using System.Collections.Concurrent;
using System.Security.Cryptography;
using System.Text;
using CollaborationSystem.Application.Abstractions;
using CollaborationSystem.Application.Auth;
using Microsoft.Extensions.Configuration;

namespace CollaborationSystem.Infrastructure.Auth;

public sealed class InMemoryRefreshSessionStore(IConfiguration configuration) : IRefreshSessionStore
{
    private const int DefaultRefreshTokenLifetimeDays = 7;
    private readonly ConcurrentDictionary<Guid, StoredRefreshSession> sessionsByUserId = new();

    public Task<RefreshToken> CreateSessionAsync(
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        var refreshToken = GenerateRefreshToken();
        var expiresAtUtc = DateTime.UtcNow.AddDays(GetRefreshTokenLifetimeDays());
        var session = new StoredRefreshSession(
            userId,
            HashToken(refreshToken),
            expiresAtUtc,
            RevokedAtUtc: null);

        sessionsByUserId.AddOrUpdate(
            userId,
            session,
            (_, _) => session);

        return Task.FromResult(new RefreshToken(refreshToken, expiresAtUtc));
    }

    public Task<RefreshSession?> ConsumeSessionAsync(
        string refreshToken,
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        var refreshTokenHash = HashToken(refreshToken);
        var session = sessionsByUserId.Values.FirstOrDefault(x =>
            x.RefreshTokenHash == refreshTokenHash &&
            x.RevokedAtUtc is null &&
            x.ExpiresAtUtc > DateTime.UtcNow);

        if (session is null)
        {
            return Task.FromResult<RefreshSession?>(null);
        }

        var revokedSession = session with { RevokedAtUtc = DateTime.UtcNow };
        sessionsByUserId.TryUpdate(session.UserId, revokedSession, session);

        return Task.FromResult<RefreshSession?>(
            new RefreshSession(session.UserId, session.ExpiresAtUtc));
    }

    public Task RevokeSessionAsync(
        string refreshToken,
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        var refreshTokenHash = HashToken(refreshToken);
        var session = sessionsByUserId.Values.FirstOrDefault(x =>
            x.RefreshTokenHash == refreshTokenHash &&
            x.RevokedAtUtc is null);

        if (session is not null)
        {
            var revokedSession = session with { RevokedAtUtc = DateTime.UtcNow };
            sessionsByUserId.TryUpdate(session.UserId, revokedSession, session);
        }

        return Task.CompletedTask;
    }

    private int GetRefreshTokenLifetimeDays()
    {
        var authSection = configuration.GetSection("Auth");

        return int.TryParse(authSection["RefreshTokenLifetimeDays"], out var configuredLifetimeDays)
            ? configuredLifetimeDays
            : DefaultRefreshTokenLifetimeDays;
    }

    private static string GenerateRefreshToken()
    {
        var bytes = RandomNumberGenerator.GetBytes(64);

        return Convert.ToBase64String(bytes);
    }

    private static string HashToken(string token)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(token));

        return Convert.ToBase64String(bytes);
    }

    private sealed record StoredRefreshSession(
        Guid UserId,
        string RefreshTokenHash,
        DateTime ExpiresAtUtc,
        DateTime? RevokedAtUtc);
}
