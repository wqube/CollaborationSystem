using CollaborationSystem.Application.DTOs.Suggestions;
using CollaborationSystem.Domain.Enums;
using CollaborationSystem.Infrastructure.Projects;
using CollaborationSystem.Infrastructure.Suggestions;
using CollaborationSystem.Tests.TestSupport;

namespace CollaborationSystem.Tests.Suggestions;

public sealed class SuggestionAuthorizationTests
{
    [Fact]
    public async Task UpdateSuggestionStatusAsync_allows_admin_and_rejects_member()
    {
        await using var dbContext = TestDbContextFactory.Create();
        var author = TestData.AddUser(dbContext);
        var admin = TestData.AddUser(dbContext);
        var member = TestData.AddUser(dbContext);
        var project = TestData.AddProject(dbContext, admin.Id);
        TestData.AddMember(dbContext, project, admin, ProjectRole.Admin);
        TestData.AddMember(dbContext, project, member, ProjectRole.Member);
        TestData.AddMember(dbContext, project, author, ProjectRole.Member);
        var suggestion = TestData.AddSuggestion(dbContext, project, author);
        await dbContext.SaveChangesAsync();

        var memberService = CreateService(dbContext, member.Id);
        var memberResult = await memberService.UpdateSuggestionStatusAsync(
            project.Id,
            suggestion.Id,
            new UpdateSuggestionStatusRequest { Status = SuggestionStatus.Accepted });

        var adminService = CreateService(dbContext, admin.Id);
        var adminResult = await adminService.UpdateSuggestionStatusAsync(
            project.Id,
            suggestion.Id,
            new UpdateSuggestionStatusRequest { Status = SuggestionStatus.Accepted });

        Assert.Equal(SuggestionOperationStatus.Forbidden, memberResult.Status);
        Assert.Equal(SuggestionOperationStatus.Success, adminResult.Status);
        Assert.NotNull(adminResult.Value);
        Assert.Equal(SuggestionStatus.Accepted, adminResult.Value.Status);
    }

    [Fact]
    public async Task UpdateSuggestionTextAsync_allows_author_and_rejects_other_project_member()
    {
        await using var dbContext = TestDbContextFactory.Create();
        var author = TestData.AddUser(dbContext);
        var otherMember = TestData.AddUser(dbContext);
        var project = TestData.AddProject(dbContext, author.Id);
        TestData.AddMember(dbContext, project, author);
        TestData.AddMember(dbContext, project, otherMember);
        var suggestion = TestData.AddSuggestion(dbContext, project, author, text: "Original text");
        await dbContext.SaveChangesAsync();

        var otherMemberService = CreateService(dbContext, otherMember.Id);
        var otherMemberResult = await otherMemberService.UpdateSuggestionTextAsync(
            project.Id,
            suggestion.Id,
            new UpdateSuggestionRequest { Text = "Hijacked text" });

        var authorService = CreateService(dbContext, author.Id);
        var authorResult = await authorService.UpdateSuggestionTextAsync(
            project.Id,
            suggestion.Id,
            new UpdateSuggestionRequest { Text = "Updated text" });

        Assert.Equal(SuggestionOperationStatus.Forbidden, otherMemberResult.Status);
        Assert.Equal(SuggestionOperationStatus.Success, authorResult.Status);
        Assert.NotNull(authorResult.Value);
        Assert.Equal("Updated text", authorResult.Value.Text);
    }

    [Fact]
    public async Task UpdateCommentAsync_allows_author_and_rejects_other_project_member()
    {
        await using var dbContext = TestDbContextFactory.Create();
        var author = TestData.AddUser(dbContext);
        var otherMember = TestData.AddUser(dbContext);
        var project = TestData.AddProject(dbContext, author.Id);
        TestData.AddMember(dbContext, project, author);
        TestData.AddMember(dbContext, project, otherMember);
        var suggestion = TestData.AddSuggestion(dbContext, project, author);
        var comment = new CollaborationSystem.Domain.Entities.Comment
        {
            ProjectId = project.Id,
            SuggestionId = suggestion.Id,
            AuthorId = author.Id,
            Text = "Original comment"
        };
        dbContext.Comments.Add(comment);
        await dbContext.SaveChangesAsync();

        var otherMemberService = CreateService(dbContext, otherMember.Id);
        var otherMemberResult = await otherMemberService.UpdateCommentAsync(
            project.Id,
            comment.Id,
            new UpdateCommentRequest { Text = "Hijacked comment" });

        var authorService = CreateService(dbContext, author.Id);
        var authorResult = await authorService.UpdateCommentAsync(
            project.Id,
            comment.Id,
            new UpdateCommentRequest { Text = "Updated comment" });

        Assert.Equal(SuggestionOperationStatus.Forbidden, otherMemberResult.Status);
        Assert.Equal(SuggestionOperationStatus.Success, authorResult.Status);
        Assert.NotNull(authorResult.Value);
        Assert.Equal("Updated comment", authorResult.Value.Text);
    }

    private static SuggestionService CreateService(
        CollaborationSystem.Infrastructure.Persistence.AppDbContext dbContext,
        Guid currentUserId) =>
        new(dbContext, new TestCurrentUserService(currentUserId), new VoteQuotaService(dbContext));
}
