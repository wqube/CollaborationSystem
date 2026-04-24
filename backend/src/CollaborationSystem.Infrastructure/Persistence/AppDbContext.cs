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
    public DbSet<ProjectMember> ProjectMembers => Set<ProjectMember>();
    public DbSet<Suggestion> Suggestions => Set<Suggestion>();
    public DbSet<Vote> Votes => Set<Vote>();
    public DbSet<Comment> Comments => Set<Comment>();
    public DbSet<Draft> Drafts => Set<Draft>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.HasDefaultSchema("public");

        builder.Entity<ProjectMember>()
            .HasIndex(x => new { x.ProjectId, x.UserId })
            .IsUnique();

        builder.Entity<Vote>()
            .HasIndex(x => new { x.SuggestionId, x.UserId })
            .IsUnique();

        builder.Entity<Comment>()
            .HasOne(x => x.ParentComment)
            .WithMany(x => x.Replies)
            .HasForeignKey(x => x.ParentCommentId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
