using CollaborationSystem.Application.DTOs.Projects;
using CollaborationSystem.Domain.Enums;
using CollaborationSystem.Infrastructure.Projects;
using CollaborationSystem.Tests.TestSupport;

namespace CollaborationSystem.Tests.Projects;

public sealed class ProjectAuthorizationTests
{
    [Fact]
    public async Task UpdateProjectAsync_allows_admin_and_rejects_member()
    {
        await using var dbContext = TestDbContextFactory.Create();
        var admin = TestData.AddUser(dbContext);
        var member = TestData.AddUser(dbContext);
        var project = TestData.AddProject(dbContext, admin.Id);
        TestData.AddMember(dbContext, project, admin, ProjectRole.Admin);
        TestData.AddMember(dbContext, project, member, ProjectRole.Member);
        await dbContext.SaveChangesAsync();

        var memberService = CreateProjectService(dbContext, member.Id);
        var memberResult = await memberService.UpdateProjectAsync(
            project.Id,
            new UpdateProjectRequest
            {
                Name = "Member update",
                Description = "Should be rejected"
            });

        var adminService = CreateProjectService(dbContext, admin.Id);
        var adminResult = await adminService.UpdateProjectAsync(
            project.Id,
            new UpdateProjectRequest
            {
                Name = "Admin update",
                Description = "Allowed"
            });

        Assert.Equal(ProjectOperationStatus.Forbidden, memberResult.Status);
        Assert.Equal(ProjectOperationStatus.Success, adminResult.Status);
        Assert.NotNull(adminResult.Value);
        Assert.Equal("Admin update", adminResult.Value.Name);
    }

    [Fact]
    public async Task AddMemberAsync_allows_admin_and_rejects_member()
    {
        await using var dbContext = TestDbContextFactory.Create();
        var admin = TestData.AddUser(dbContext);
        var member = TestData.AddUser(dbContext);
        var targetUser = TestData.AddUser(dbContext);
        var project = TestData.AddProject(dbContext, admin.Id);
        TestData.AddMember(dbContext, project, admin, ProjectRole.Admin);
        TestData.AddMember(dbContext, project, member, ProjectRole.Member);
        await dbContext.SaveChangesAsync();

        var memberService = CreateProjectMemberService(dbContext, member.Id);
        var memberResult = await memberService.AddMemberAsync(
            project.Id,
            new AddProjectMemberRequest
            {
                UserId = targetUser.Id,
                Role = ProjectRole.Member
            });

        var adminService = CreateProjectMemberService(dbContext, admin.Id);
        var adminResult = await adminService.AddMemberAsync(
            project.Id,
            new AddProjectMemberRequest
            {
                UserId = targetUser.Id,
                Role = ProjectRole.Member
            });

        Assert.Equal(ProjectMemberOperationStatus.Forbidden, memberResult.Status);
        Assert.Equal(ProjectMemberOperationStatus.Success, adminResult.Status);
        Assert.NotNull(adminResult.Member);
        Assert.Equal(targetUser.Id, adminResult.Member.UserId);
    }

    private static ProjectService CreateProjectService(
        CollaborationSystem.Infrastructure.Persistence.AppDbContext dbContext,
        Guid currentUserId) =>
        new(dbContext, new TestCurrentUserService(currentUserId), new VoteQuotaService(dbContext));

    private static ProjectMemberService CreateProjectMemberService(
        CollaborationSystem.Infrastructure.Persistence.AppDbContext dbContext,
        Guid currentUserId) =>
        new(dbContext, new TestCurrentUserService(currentUserId));
}
