using System.Security.Cryptography;
using System.Text;
using CollaborationSystem.Application.Abstractions;
using CollaborationSystem.Application.Auth;
using CollaborationSystem.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using RefreshSessionEntity = CollaborationSystem.Domain.Entities.RefreshSession;

namespace CollaborationSystem.Infrastructure.Auth;

public sealed class DbRefreshSessionStore(
    AppDbContext dbContext,
    IConfiguration configuration) : IRefreshSessionStore
{
    private const int DefaultRefreshTokenLifetimeDays = 7;

    public async Task<RefreshToken> CreateSessionAsync(
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        var refreshToken = GenerateRefreshToken();
        var expiresAtUtc = DateTime.UtcNow.AddDays(GetRefreshTokenLifetimeDays());
        var refreshTokenHash = HashToken(refreshToken);

        var activeSessions = await dbContext.RefreshSessions
            .Where(x => x.UserId == userId && x.RevokedAtUtc == null)
            .ToListAsync(cancellationToken);

        var utcNow = DateTime.UtcNow;

        foreach (var session in activeSessions)
        {
            session.RevokedAtUtc = utcNow;
            session.UpdatedAtUtc = utcNow;
        }

        dbContext.RefreshSessions.Add(new RefreshSessionEntity
        {
            UserId = userId,
            RefreshTokenHash = refreshTokenHash,
            ExpiresAtUtc = expiresAtUtc,
            RevokedAtUtc = null,
            CreatedAtUtc = utcNow,
            UpdatedAtUtc = utcNow
        });

        await dbContext.SaveChangesAsync(cancellationToken);

        return new RefreshToken(refreshToken, expiresAtUtc);
    }

    public async Task<RefreshSession?> ConsumeSessionAsync(
        string refreshToken,
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        var refreshTokenHash = HashToken(refreshToken);

        var session = await dbContext.RefreshSessions
            .FirstOrDefaultAsync(x =>
                x.RefreshTokenHash == refreshTokenHash &&
                x.RevokedAtUtc == null &&
                x.ExpiresAtUtc > DateTime.UtcNow,
                cancellationToken);

        if (session is null)
        {
            return null;
        }

        session.RevokedAtUtc = DateTime.UtcNow;
        session.UpdatedAtUtc = DateTime.UtcNow;

        await dbContext.SaveChangesAsync(cancellationToken);

        return new RefreshSession(session.UserId, session.ExpiresAtUtc);
    }

    public async Task RevokeSessionAsync(
        string refreshToken,
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        var refreshTokenHash = HashToken(refreshToken);

        var session = await dbContext.RefreshSessions
            .FirstOrDefaultAsync(
                x => x.RefreshTokenHash == refreshTokenHash && x.RevokedAtUtc == null,
                cancellationToken);

        if (session is null)
        {
            return;
        }

        session.RevokedAtUtc = DateTime.UtcNow;
        session.UpdatedAtUtc = DateTime.UtcNow;

        await dbContext.SaveChangesAsync(cancellationToken);
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
}
