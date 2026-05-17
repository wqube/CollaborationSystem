using CollaborationSystem.Application.DTOs.Suggestions;
using CollaborationSystem.Domain.Enums;
using CollaborationSystem.Infrastructure.Projects;
using CollaborationSystem.Infrastructure.Suggestions;
using CollaborationSystem.Tests.TestSupport;

namespace CollaborationSystem.Tests.Suggestions;

public sealed class SuggestionVotingTests
{
    [Fact]
    public async Task GetSuggestionByIdAsync_calculates_score_as_up_votes_minus_down_votes()
    {
        await using var dbContext = TestDbContextFactory.Create();
        var author = TestData.AddUser(dbContext);
        var upVoter = TestData.AddUser(dbContext);
        var downVoter = TestData.AddUser(dbContext);
        var currentUser = TestData.AddUser(dbContext);
        var project = TestData.AddProject(dbContext, author.Id);
        TestData.AddMember(dbContext, project, author);
        TestData.AddMember(dbContext, project, upVoter);
        TestData.AddMember(dbContext, project, downVoter);
        TestData.AddMember(dbContext, project, currentUser);
        var suggestion = TestData.AddSuggestion(dbContext, project, author);
        TestData.AddVote(dbContext, suggestion, author, VoteType.Up);
        TestData.AddVote(dbContext, suggestion, upVoter, VoteType.Up);
        TestData.AddVote(dbContext, suggestion, downVoter, VoteType.Down);
        await dbContext.SaveChangesAsync();
        var service = CreateService(dbContext, currentUser.Id);

        var result = await service.GetSuggestionByIdAsync(project.Id, suggestion.Id);

        Assert.Equal(SuggestionOperationStatus.Success, result.Status);
        Assert.NotNull(result.Value);
        Assert.Equal(1, result.Value.Score);
    }

    [Fact]
    public async Task SetVoteAsync_consumes_quota_only_for_a_new_vote_and_blocks_when_limit_is_exceeded()
    {
        await using var dbContext = TestDbContextFactory.Create();
        var author = TestData.AddUser(dbContext);
        var voter = TestData.AddUser(dbContext);
        var project = TestData.AddProject(dbContext, author.Id, votesPerUser: 1);
        var periodStartedAtUtc = DateTime.UtcNow.AddDays(-1);
        TestData.AddMember(dbContext, project, author);
        TestData.AddMember(
            dbContext,
            project,
            voter,
            votesRemaining: 1,
            votePeriodStartedAtUtc: periodStartedAtUtc);
        var firstSuggestion = TestData.AddSuggestion(dbContext, project, author, text: "First suggestion");
        var secondSuggestion = TestData.AddSuggestion(dbContext, project, author, text: "Second suggestion");
        await dbContext.SaveChangesAsync();
        var service = CreateService(dbContext, voter.Id);

        var firstVote = await service.SetVoteAsync(
            project.Id,
            firstSuggestion.Id,
            new VoteRequest { VoteType = VoteType.Up });
        var changedVote = await service.SetVoteAsync(
            project.Id,
            firstSuggestion.Id,
            new VoteRequest { VoteType = VoteType.Down });
        var overLimitVote = await service.SetVoteAsync(
            project.Id,
            secondSuggestion.Id,
            new VoteRequest { VoteType = VoteType.Up });

        Assert.Equal(SuggestionOperationStatus.Success, firstVote.Status);
        Assert.NotNull(firstVote.Value);
        Assert.Equal(0, firstVote.Value.VoteQuota.VotesRemaining);
        Assert.Equal(1, firstVote.Value.Score);

        Assert.Equal(SuggestionOperationStatus.Success, changedVote.Status);
        Assert.NotNull(changedVote.Value);
        Assert.Equal(0, changedVote.Value.VoteQuota.VotesRemaining);
        Assert.Equal(-1, changedVote.Value.Score);

        Assert.Equal(SuggestionOperationStatus.VoteLimitExceeded, overLimitVote.Status);
        var quota = Assert.IsType<CollaborationSystem.Application.DTOs.Projects.CurrentUserVoteQuotaResponse>(
            overLimitVote.ErrorDetails);
        Assert.Equal(0, quota.VotesRemaining);
    }

    [Fact]
    public async Task RemoveVoteAsync_restores_quota_for_vote_created_in_current_period()
    {
        await using var dbContext = TestDbContextFactory.Create();
        var author = TestData.AddUser(dbContext);
        var voter = TestData.AddUser(dbContext);
        var project = TestData.AddProject(dbContext, author.Id, votesPerUser: 2);
        var periodStartedAtUtc = DateTime.UtcNow.AddDays(-1);
        TestData.AddMember(dbContext, project, author);
        TestData.AddMember(
            dbContext,
            project,
            voter,
            votesRemaining: 1,
            votePeriodStartedAtUtc: periodStartedAtUtc);
        var suggestion = TestData.AddSuggestion(dbContext, project, author);
        TestData.AddVote(dbContext, suggestion, voter, VoteType.Up, periodStartedAtUtc);
        await dbContext.SaveChangesAsync();
        var service = CreateService(dbContext, voter.Id);

        var result = await service.RemoveVoteAsync(project.Id, suggestion.Id);

        Assert.Equal(SuggestionOperationStatus.Success, result.Status);
        Assert.NotNull(result.Value);
        Assert.Null(result.Value.CurrentUserVote);
        Assert.Equal(0, result.Value.Score);
        Assert.Equal(2, result.Value.VoteQuota.VotesRemaining);
    }

    private static SuggestionService CreateService(
        CollaborationSystem.Infrastructure.Persistence.AppDbContext dbContext,
        Guid currentUserId) =>
        new(dbContext, new TestCurrentUserService(currentUserId), new VoteQuotaService(dbContext));
}
