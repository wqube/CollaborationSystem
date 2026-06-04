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
            "password"),
        new(
            Guid.Parse("33333333-3333-3333-3333-333333333333"),
            "mikhail.baranov@test.local",
            "Михаил Баранов",
            "TBANK\\mikhail.baranov",
            "password"),
        new(
            Guid.Parse("44444444-4444-4444-4444-444444444444"),
            "anna.ivanova@test.local",
            "Анна Иванова",
            "TBANK\\anna.ivanova",
            "password"),
        new(
            Guid.Parse("55555555-5555-5555-5555-555555555555"),
            "dmitry.petrov@test.local",
            "Дмитрий Петров",
            "TBANK\\dmitry.petrov",
            "password"),
        new(
            Guid.Parse("66666666-6666-6666-6666-666666666666"),
            "ekaterina.smirnova@test.local",
            "Екатерина Смирнова",
            "TBANK\\ekaterina.smirnova",
            "password"),
        new(
            Guid.Parse("77777777-7777-7777-7777-777777777777"),
            "ivan.kuznetsov@test.local",
            "Иван Кузнецов",
            "TBANK\\ivan.kuznetsov",
            "password"),
        new(
            Guid.Parse("88888888-8888-8888-8888-888888888888"),
            "sofia.popova@test.local",
            "София Попова",
            "TBANK\\sofia.popova",
            "password"),
        new(
            Guid.Parse("99999999-9999-9999-9999-999999999999"),
            "alexey.volkov@test.local",
            "Алексей Волков",
            "TBANK\\alexey.volkov",
            "password"),
        new(
            Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
            "maria.sokolova@test.local",
            "Мария Соколова",
            "TBANK\\maria.sokolova",
            "password"),
        new(
            Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"),
            "elmir.nurullin@test.local",
            "Эльмир Нуруллин",
            "TBANK\\elmir.nurullin",
            "password"),
        new(
            Guid.Parse("cccccccc-cccc-cccc-cccc-cccccccccccc"),
            "nikita.malyshonkov@test.local",
            "Никита Малышонков",
            "TBANK\\nikita.malyshonkov",
            "password"),
        new(
            Guid.Parse("dddddddd-dddd-dddd-dddd-dddddddddddd"),
            "vsevolod.zavarzin@test.local",
            "Заварзин Всеволод",
            "TBANK\\vsevolod.zavarzin",
            "password"),
        new(
            Guid.Parse("eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee"),
            "alexander.tarasov@test.local",
            "Тарасов Александр",
            "TBANK\\alexander.tarasov",
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
