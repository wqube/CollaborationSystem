using CollaborationSystem.Application.DTOs.Projects;
using CollaborationSystem.Domain.Entities;
using CollaborationSystem.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace CollaborationSystem.Infrastructure.Projects;

public sealed class VoteQuotaService(AppDbContext dbContext)
{
    public bool ApplyLazyReset(Project project, ProjectMember member, DateTime utcNow)
    {
        if (member.NextVoteResetAtUtc > utcNow)
        {
            return false;
        }

        ResetQuota(project, member, utcNow);

        return true;
    }

    public CurrentUserVoteQuotaResponse ToResponse(Project project, ProjectMember member) =>
        new()
        {
            VotesLimit = project.VotesPerUser,
            VotesRemaining = member.VotesRemaining,
            NextResetAt = member.NextVoteResetAtUtc
        };

    public async Task RecalculateProjectQuotasAsync(
        Project project,
        DateTime utcNow,
        CancellationToken cancellationToken)
    {
        var members = await dbContext.ProjectMembers
            .Where(x => x.ProjectId == project.Id)
            .ToListAsync(cancellationToken);

        foreach (var member in members)
        {
            var nextResetAtUtc = member.VotePeriodStartedAtUtc.AddDays(project.VoteResetPeriodDays);

            if (nextResetAtUtc <= utcNow)
            {
                ResetQuota(project, member, utcNow);
                continue;
            }

            var spentVotes = await dbContext.Votes
                .AsNoTracking()
                .CountAsync(
                    x => x.UserId == member.UserId &&
                         x.BudgetPeriodStartedAtUtc == member.VotePeriodStartedAtUtc &&
                         x.Suggestion != null &&
                         x.Suggestion.ProjectId == project.Id,
                    cancellationToken);

            member.VotesRemaining = Math.Max(0, project.VotesPerUser - spentVotes);
            member.NextVoteResetAtUtc = nextResetAtUtc;
            member.UpdatedAtUtc = utcNow;
        }
    }

    public static void InitializeQuota(Project project, ProjectMember member, DateTime utcNow)
    {
        member.VotesRemaining = project.VotesPerUser;
        member.VotePeriodStartedAtUtc = utcNow;
        member.NextVoteResetAtUtc = utcNow.AddDays(project.VoteResetPeriodDays);
    }

    private static void ResetQuota(Project project, ProjectMember member, DateTime utcNow)
    {
        member.VotesRemaining = project.VotesPerUser;
        member.VotePeriodStartedAtUtc = utcNow;
        member.NextVoteResetAtUtc = utcNow.AddDays(project.VoteResetPeriodDays);
        member.UpdatedAtUtc = utcNow;
    }
}
