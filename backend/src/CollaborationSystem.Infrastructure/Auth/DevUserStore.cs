using CollaborationSystem.Application.Abstractions;
using CollaborationSystem.Application.Auth;
using Microsoft.AspNetCore.Identity;

namespace CollaborationSystem.Infrastructure.Auth;

public sealed class DevUserStore : IDevUserStore
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

    private readonly PasswordHasher<StoredDevUser> passwordHasher = new();
    private readonly IReadOnlyList<StoredDevUser> users;

    public DevUserStore()
    {
        users = SeedUsers
            .Select(seed =>
            {
                var user = new StoredDevUser(
                    seed.Id,
                    seed.Email,
                    seed.DisplayName,
                    seed.DomainLogin,
                    PasswordHash: string.Empty);

                return user with
                {
                    PasswordHash = passwordHasher.HashPassword(user, seed.Password)
                };
            })
            .ToArray();
    }

    public Task<DevUser?> FindByIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        var user = users.FirstOrDefault(x => x.Id == userId);

        return Task.FromResult(user is null ? null : ToDevUser(user));
    }

    public Task<DevUser?> ValidateCredentialsAsync(
        string email,
        string password,
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        var user = users.FirstOrDefault(x =>
            string.Equals(x.Email, email, StringComparison.OrdinalIgnoreCase));

        if (user is null)
        {
            return Task.FromResult<DevUser?>(null);
        }

        var verificationResult = passwordHasher.VerifyHashedPassword(
            user,
            user.PasswordHash,
            password);

        return Task.FromResult(
            verificationResult == PasswordVerificationResult.Failed
                ? null
                : ToDevUser(user));
    }

    private static DevUser ToDevUser(StoredDevUser user) =>
        new(user.Id, user.Email, user.DisplayName, user.DomainLogin);

    private sealed record SeedUser(
        Guid Id,
        string Email,
        string DisplayName,
        string DomainLogin,
        string Password);

    private sealed record StoredDevUser(
        Guid Id,
        string Email,
        string DisplayName,
        string DomainLogin,
        string PasswordHash);
}
