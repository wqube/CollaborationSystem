using CollaborationSystem.Domain.Entities;
using CollaborationSystem.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace CollaborationSystem.Infrastructure.Persistence;

public class AppDbContext(DbContextOptions<AppDbContext> options)
    : IdentityDbContext<ApplicationIdentityUser, IdentityRole<Guid>, Guid>(options)
{
    public DbSet<AppUser> UsersProfile => Set<AppUser>();
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<ProjectMeeting> ProjectMeetings => Set<ProjectMeeting>();
    public DbSet<ProjectMember> ProjectMembers => Set<ProjectMember>();
    public DbSet<Suggestion> Suggestions => Set<Suggestion>();
    public DbSet<Vote> Votes => Set<Vote>();
    public DbSet<Comment> Comments => Set<Comment>();
    public DbSet<Draft> Drafts => Set<Draft>();
    public DbSet<RefreshSession> RefreshSessions => Set<RefreshSession>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.HasDefaultSchema("public");

        builder.Entity<AppUser>().ToTable("Users");
        builder.Entity<Project>().ToTable("Projects");
        builder.Entity<ProjectMeeting>().ToTable("ProjectMeetings");
        builder.Entity<ProjectMember>().ToTable("ProjectMembers");
        builder.Entity<Suggestion>().ToTable("Suggestions");
        builder.Entity<Vote>().ToTable("Votes");
        builder.Entity<Comment>().ToTable("Comments");
        builder.Entity<Draft>().ToTable("Drafts");
        builder.Entity<RefreshSession>().ToTable("AuthSessions");

        builder.Entity<ProjectMember>()
            .HasIndex(x => new { x.ProjectId, x.UserId })
            .IsUnique();

        builder.Entity<AppUser>()
            .HasIndex(x => x.Email)
            .IsUnique();

        builder.Entity<AppUser>()
            .Property(x => x.Email)
            .HasMaxLength(256);

        builder.Entity<AppUser>()
            .Property(x => x.DisplayName)
            .HasMaxLength(256);

        builder.Entity<AppUser>()
            .Property(x => x.PasswordHash)
            .HasMaxLength(512);

        builder.Entity<AppUser>()
            .Property(x => x.DomainLogin)
            .HasMaxLength(256);

        builder.Entity<Project>()
            .Property(x => x.Name)
            .HasMaxLength(200);

        builder.Entity<Project>()
            .Property(x => x.NormalizedName)
            .HasMaxLength(200);

        builder.Entity<Project>()
            .HasIndex(x => x.NormalizedName)
            .IsUnique()
            .HasDatabaseName("UX_Projects_NormalizedName_Active")
            .HasFilter("\"DeletedAtUtc\" IS NULL");

        builder.Entity<Project>()
            .Property(x => x.VotesPerUser)
            .HasDefaultValue(Project.DefaultVotesPerUser);

        builder.Entity<Project>()
            .Property(x => x.VoteResetPeriodDays)
            .HasDefaultValue(Project.DefaultVoteResetPeriodDays);

        builder.Entity<ProjectMember>()
            .Property(x => x.Role)
            .HasConversion<string>();

        builder.Entity<ProjectMeeting>()
            .Property(x => x.Title)
            .HasMaxLength(200);

        builder.Entity<ProjectMeeting>()
            .Property(x => x.Location)
            .HasMaxLength(300);

        builder.Entity<ProjectMeeting>()
            .HasOne(x => x.Project)
            .WithMany(x => x.Meetings)
            .HasForeignKey(x => x.ProjectId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<ProjectMeeting>()
            .HasOne(x => x.CreatedByUser)
            .WithMany()
            .HasForeignKey(x => x.CreatedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<Suggestion>()
            .Property(x => x.Status)
            .HasConversion<string>();

        builder.Entity<Suggestion>()
            .Property(x => x.NormalizedText)
            .HasMaxLength(4000);

        builder.Entity<Suggestion>()
            .HasIndex(x => new { x.ProjectId, x.NormalizedText })
            .IsUnique()
            .HasDatabaseName("UX_Suggestions_ProjectId_NormalizedText");

        builder.Entity<Vote>()
            .HasIndex(x => new { x.SuggestionId, x.UserId })
            .IsUnique();

        builder.Entity<Vote>()
            .Property(x => x.VoteType)
            .HasConversion<string>();

        builder.Entity<Draft>()
            .Property(x => x.Type)
            .HasConversion<string>();

        builder.Entity<Draft>()
            .Property(x => x.PayloadJson)
            .HasColumnType("jsonb");

        builder.Entity<Comment>()
            .HasOne(x => x.ParentComment)
            .WithMany(x => x.Replies)
            .HasForeignKey(x => x.ParentCommentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<RefreshSession>()
            .HasIndex(x => x.RefreshTokenHash)
            .IsUnique();

        builder.Entity<RefreshSession>()
            .HasIndex(x => x.UserId)
            .IsUnique()
            .HasDatabaseName("IX_AuthSessions_UserId_Active")
            .HasFilter("\"RevokedAtUtc\" IS NULL");

        builder.Entity<RefreshSession>()
            .Property(x => x.RefreshTokenHash)
            .HasMaxLength(256);

        builder.Entity<RefreshSession>()
            .HasOne(x => x.User)
            .WithMany(x => x.RefreshSessions)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<AppUser>().HasData(
            new AppUser
            {
                Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
                Email = "test@test.local",
                DisplayName = "Test User",
                PasswordHash = "DEV_PASSWORD_HASH",
                DomainLogin = "TBANK\\test.user",
                CreatedAtUtc = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAtUtc = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new AppUser
            {
                Id = Guid.Parse("22222222-2222-2222-2222-222222222222"),
                Email = "admin@test.local",
                DisplayName = "Admin User",
                PasswordHash = "DEV_PASSWORD_HASH",
                DomainLogin = "TBANK\\admin.user",
                CreatedAtUtc = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAtUtc = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new AppUser
            {
                Id = Guid.Parse("33333333-3333-3333-3333-333333333333"),
                Email = "mikhail.baranchik@test.local",
                DisplayName = "Михаил Баранчик",
                PasswordHash = "DEV_PASSWORD_HASH",
                DomainLogin = "TBANK\\mikhail.baranchik",
                CreatedAtUtc = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAtUtc = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new AppUser
            {
                Id = Guid.Parse("44444444-4444-4444-4444-444444444444"),
                Email = "anna.ivanova@test.local",
                DisplayName = "Анна Иванова",
                PasswordHash = "DEV_PASSWORD_HASH",
                DomainLogin = "TBANK\\anna.ivanova",
                CreatedAtUtc = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAtUtc = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new AppUser
            {
                Id = Guid.Parse("55555555-5555-5555-5555-555555555555"),
                Email = "dmitry.petrov@test.local",
                DisplayName = "Дмитрий Петров",
                PasswordHash = "DEV_PASSWORD_HASH",
                DomainLogin = "TBANK\\dmitry.petrov",
                CreatedAtUtc = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAtUtc = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new AppUser
            {
                Id = Guid.Parse("66666666-6666-6666-6666-666666666666"),
                Email = "ekaterina.smirnova@test.local",
                DisplayName = "Екатерина Смирнова",
                PasswordHash = "DEV_PASSWORD_HASH",
                DomainLogin = "TBANK\\ekaterina.smirnova",
                CreatedAtUtc = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAtUtc = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new AppUser
            {
                Id = Guid.Parse("77777777-7777-7777-7777-777777777777"),
                Email = "ivan.kuznetsov@test.local",
                DisplayName = "Иван Кузнецов",
                PasswordHash = "DEV_PASSWORD_HASH",
                DomainLogin = "TBANK\\ivan.kuznetsov",
                CreatedAtUtc = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAtUtc = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new AppUser
            {
                Id = Guid.Parse("88888888-8888-8888-8888-888888888888"),
                Email = "sofia.popova@test.local",
                DisplayName = "София Попова",
                PasswordHash = "DEV_PASSWORD_HASH",
                DomainLogin = "TBANK\\sofia.popova",
                CreatedAtUtc = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAtUtc = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new AppUser
            {
                Id = Guid.Parse("99999999-9999-9999-9999-999999999999"),
                Email = "alexey.volkov@test.local",
                DisplayName = "Алексей Волков",
                PasswordHash = "DEV_PASSWORD_HASH",
                DomainLogin = "TBANK\\alexey.volkov",
                CreatedAtUtc = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAtUtc = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new AppUser
            {
                Id = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
                Email = "maria.sokolova@test.local",
                DisplayName = "Мария Соколова",
                PasswordHash = "DEV_PASSWORD_HASH",
                DomainLogin = "TBANK\\maria.sokolova",
                CreatedAtUtc = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAtUtc = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            });
    }
}
