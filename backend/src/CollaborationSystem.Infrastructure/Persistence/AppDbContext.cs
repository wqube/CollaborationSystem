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
            .HasMaxLength(2000);

        builder.Entity<Suggestion>()
            .HasIndex(x => new { x.ProjectId, x.NormalizedText });

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
            });
    }
}
