using CollaborationSystem.Domain.Entities;
using CollaborationSystem.Domain.Enums;
using CollaborationSystem.Infrastructure.Persistence;

namespace CollaborationSystem.Tests.TestSupport;

internal static class TestData
{
    public static AppUser AddUser(AppDbContext dbContext, Guid? id = null, string? email = null)
    {
        var userId = id ?? Guid.NewGuid();
        var user = new AppUser
        {
            Id = userId,
            Email = email ?? $"{userId:N}@example.com",
            DisplayName = $"User {userId.ToString("N")[..8]}",
            PasswordHash = "hash",
            DomainLogin = $"TEST\\{userId:N}"
        };

        dbContext.UsersProfile.Add(user);
        return user;
    }

    public static Project AddProject(
        AppDbContext dbContext,
        Guid createdByUserId,
        int votesPerUser = Project.DefaultVotesPerUser,
        int voteResetPeriodDays = Project.DefaultVoteResetPeriodDays)
    {
        var id = Guid.NewGuid();
        var project = new Project
        {
            Id = id,
            Name = $"Project {id:N}",
            NormalizedName = $"project {id:N}",
            Description = "Project description",
            CreatedByUserId = createdByUserId,
            VotesPerUser = votesPerUser,
            VoteResetPeriodDays = voteResetPeriodDays
        };

        dbContext.Projects.Add(project);
        return project;
    }

    public static ProjectMember AddMember(
        AppDbContext dbContext,
        Project project,
        AppUser user,
        ProjectRole role = ProjectRole.Member,
        int? votesRemaining = null,
        DateTime? votePeriodStartedAtUtc = null)
    {
        var periodStartedAtUtc = votePeriodStartedAtUtc ?? DateTime.UtcNow;
        var member = new ProjectMember
        {
            ProjectId = project.Id,
            UserId = user.Id,
            Role = role,
            JoinedAtUtc = periodStartedAtUtc,
            VotesRemaining = votesRemaining ?? project.VotesPerUser,
            VotePeriodStartedAtUtc = periodStartedAtUtc,
            NextVoteResetAtUtc = periodStartedAtUtc.AddDays(project.VoteResetPeriodDays)
        };

        dbContext.ProjectMembers.Add(member);
        return member;
    }

    public static Suggestion AddSuggestion(
        AppDbContext dbContext,
        Project project,
        AppUser author,
        SuggestionStatus status = SuggestionStatus.New,
        string text = "Suggestion text")
    {
        var suggestion = new Suggestion
        {
            ProjectId = project.Id,
            AuthorId = author.Id,
            Text = text,
            NormalizedText = text.Trim().ToLowerInvariant(),
            Status = status
        };

        dbContext.Suggestions.Add(suggestion);
        return suggestion;
    }

    public static Vote AddVote(
        AppDbContext dbContext,
        Suggestion suggestion,
        AppUser user,
        VoteType voteType,
        DateTime? budgetPeriodStartedAtUtc = null)
    {
        var vote = new Vote
        {
            SuggestionId = suggestion.Id,
            UserId = user.Id,
            VoteType = voteType,
            BudgetPeriodStartedAtUtc = budgetPeriodStartedAtUtc ?? DateTime.UtcNow
        };

        dbContext.Votes.Add(vote);
        return vote;
    }
}
