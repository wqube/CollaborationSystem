using CollaborationSystem.Application.Abstractions;
using CollaborationSystem.Application.Auth;
using CollaborationSystem.Domain.Entities;
using CollaborationSystem.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace CollaborationSystem.Infrastructure.Auth;

public sealed class DevUserStore(AppDbContext dbContext) : IDevUserStore
{
    private static readonly SeedUser[] SeedUsers =
    [
        new(
            Guid.Parse("11111111-1111-1111-1111-111111111111"),
            "test@test.local",
            "Test User",
            "TBANK\\test.user",
            "password"),
        new(
            Guid.Parse("22222222-2222-2222-2222-222222222222"),
            "admin@test.local",
            "Admin User",
            "TBANK\\admin.user",
            "password")
    ];

    private const string LegacySeedPasswordHash = "DEV_PASSWORD_HASH";
    private readonly PasswordHasher<AppUser> passwordHasher = new();

    public async Task<DevUser?> FindByIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        var user = await dbContext.UsersProfile
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == userId, cancellationToken);

        return user is null ? null : ToDevUser(user);
    }

    public async Task<DevUser?> ValidateCredentialsAsync(
        string email,
        string password,
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        var normalizedEmail = email.Trim().ToLowerInvariant();
        var user = await dbContext.UsersProfile
            .FirstOrDefaultAsync(x => x.Email.ToLower() == normalizedEmail, cancellationToken);

        if (user is null)
        {
            var seed = SeedUsers.FirstOrDefault(x =>
                string.Equals(x.Email, normalizedEmail, StringComparison.OrdinalIgnoreCase) &&
                x.Password == password);

            if (seed is null)
            {
                return null;
            }

            user = new AppUser
            {
                Id = seed.Id,
                Email = seed.Email,
                DisplayName = seed.DisplayName,
                DomainLogin = seed.DomainLogin
            };
            user.PasswordHash = passwordHasher.HashPassword(user, password);

            dbContext.UsersProfile.Add(user);
            await dbContext.SaveChangesAsync(cancellationToken);

            return ToDevUser(user);
        }

        if (user.PasswordHash == LegacySeedPasswordHash)
        {
            var seed = SeedUsers.FirstOrDefault(x =>
                string.Equals(x.Email, user.Email, StringComparison.OrdinalIgnoreCase) &&
                x.Password == password);

            if (seed is null)
            {
                return null;
            }

            user.PasswordHash = passwordHasher.HashPassword(user, password);
            user.UpdatedAtUtc = DateTime.UtcNow;
            await dbContext.SaveChangesAsync(cancellationToken);

            return ToDevUser(user);
        }

        var verificationResult = passwordHasher.VerifyHashedPassword(user, user.PasswordHash, password);

        return verificationResult == PasswordVerificationResult.Failed ? null : ToDevUser(user);
    }

    private static DevUser ToDevUser(AppUser user) =>
        new(user.Id, user.Email, user.DisplayName, user.DomainLogin);

    private sealed record SeedUser(
        Guid Id,
        string Email,
        string DisplayName,
        string DomainLogin,
        string Password);
}
