using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using CollaborationSystem.Application.DTOs.Auth;
using CollaborationSystem.Application.DTOs.Drafts;
using CollaborationSystem.Application.DTOs.Projects;
using CollaborationSystem.Application.DTOs.Suggestions;
using CollaborationSystem.Application.DTOs.Users;
using CollaborationSystem.Domain.Enums;
using Microsoft.AspNetCore.Mvc.Testing;

namespace CollaborationSystem.Tests.Integration;

public sealed class ApiIntegrationTests(IntegrationTestWebApplicationFactory factory)
    : IClassFixture<IntegrationTestWebApplicationFactory>
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web)
    {
        Converters = { new JsonStringEnumConverter() }
    };

    private static readonly Guid TestUserId = Guid.Parse("11111111-1111-1111-1111-111111111111");
    private static readonly Guid AdminUserId = Guid.Parse("22222222-2222-2222-2222-222222222222");

    [Fact]
    public async Task Main_project_flow_creates_project_member_suggestion_vote_and_updates_status()
    {
        await factory.ResetDatabaseAsync();
        using var adminClient = await CreateAuthorizedClientAsync("admin@test.local");
        using var memberClient = await CreateAuthorizedClientAsync("test@test.local");

        var project = await CreateProjectAsync(adminClient, "Integration main flow");
        var member = await AddMemberAsync(adminClient, project.Id, TestUserId, ProjectRole.Member);
        var suggestion = await CreateSuggestionAsync(memberClient, project.Id, "Add integration smoke checks");

        var voteResponse = await PutJsonAsync<VoteResponse>(
            memberClient,
            $"/api/v1/projects/{project.Id}/suggestions/{suggestion.Id}/vote",
            new VoteRequest { VoteType = VoteType.Up });
        var updatedSuggestion = await PatchJsonAsync<SuggestionSummaryResponse>(
            adminClient,
            $"/api/v1/projects/{project.Id}/suggestions/{suggestion.Id}/status",
            new UpdateSuggestionStatusRequest { Status = SuggestionStatus.Accepted });

        Assert.Equal(ProjectRole.Member, member.Role);
        Assert.Equal(VoteType.Up, voteResponse.CurrentUserVote);
        Assert.Equal(1, voteResponse.Score);
        Assert.Equal(SuggestionStatus.Accepted, updatedSuggestion.Status);
    }

    [Fact]
    public async Task Auth_flow_login_refresh_logout_then_repeat_refresh_returns_unauthorized()
    {
        await factory.ResetDatabaseAsync();
        using var client = CreateClientWithCookies();

        var login = await PostJsonAsync<AuthResponse>(
            client,
            "/api/v1/auth/login",
            new LoginRequest { Email = "admin@test.local", Password = "password" });
        var refresh = await PostJsonAsync<RefreshResponse>(client, "/api/v1/auth/refresh", value: null);

        var logoutResponse = await client.PostAsync("/api/v1/auth/logout", content: null);
        var repeatedRefreshResponse = await client.PostAsync("/api/v1/auth/refresh", content: null);

        Assert.False(string.IsNullOrWhiteSpace(login.AccessToken));
        Assert.False(string.IsNullOrWhiteSpace(refresh.AccessToken));
        Assert.Equal(HttpStatusCode.NoContent, logoutResponse.StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, repeatedRefreshResponse.StatusCode);
    }

    [Fact]
    public async Task Voting_over_project_limit_returns_conflict()
    {
        await factory.ResetDatabaseAsync();
        using var adminClient = await CreateAuthorizedClientAsync("admin@test.local");
        using var memberClient = await CreateAuthorizedClientAsync("test@test.local");

        var project = await CreateProjectAsync(adminClient, "Integration vote limit");
        await PatchJsonAsync<ProjectVoteSettingsResponse>(
            adminClient,
            $"/api/v1/projects/{project.Id}/settings",
            new UpdateProjectSettingsRequest { VotesPerUser = 1, VoteResetPeriodDays = 14 });
        await AddMemberAsync(adminClient, project.Id, TestUserId, ProjectRole.Member);
        var firstSuggestion = await CreateSuggestionAsync(adminClient, project.Id, "First option");
        var secondSuggestion = await CreateSuggestionAsync(adminClient, project.Id, "Second option");

        var firstVoteResponse = await memberClient.PutAsJsonAsync(
            $"/api/v1/projects/{project.Id}/suggestions/{firstSuggestion.Id}/vote",
            new VoteRequest { VoteType = VoteType.Up },
            JsonOptions);
        var overLimitResponse = await memberClient.PutAsJsonAsync(
            $"/api/v1/projects/{project.Id}/suggestions/{secondSuggestion.Id}/vote",
            new VoteRequest { VoteType = VoteType.Up },
            JsonOptions);

        Assert.Equal(HttpStatusCode.OK, firstVoteResponse.StatusCode);
        Assert.Equal(HttpStatusCode.Conflict, overLimitResponse.StatusCode);
    }

    [Fact]
    public async Task Member_cannot_update_suggestion_status()
    {
        await factory.ResetDatabaseAsync();
        using var adminClient = await CreateAuthorizedClientAsync("admin@test.local");
        using var memberClient = await CreateAuthorizedClientAsync("test@test.local");

        var project = await CreateProjectAsync(adminClient, "Integration status permissions");
        await AddMemberAsync(adminClient, project.Id, TestUserId, ProjectRole.Member);
        var suggestion = await CreateSuggestionAsync(memberClient, project.Id, "Only admin can accept");

        var response = await memberClient.PatchAsJsonAsync(
            $"/api/v1/projects/{project.Id}/suggestions/{suggestion.Id}/status",
            new UpdateSuggestionStatusRequest { Status = SuggestionStatus.Accepted },
            JsonOptions);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Users_endpoint_returns_seeded_users_after_login()
    {
        await factory.ResetDatabaseAsync();
        using var adminClient = await CreateAuthorizedClientAsync("admin@test.local");
        using var memberClient = await CreateAuthorizedClientAsync("test@test.local");

        var users = await GetJsonAsync<PagedResponse<UserListItemResponse>>(
            adminClient,
            "/api/v1/users?page=1&pageSize=10");

        Assert.Contains(users.Items, user => user.Email == "admin@test.local");
        Assert.Contains(users.Items, user => user.Email == "test@test.local");
        Assert.True(users.Total >= 2);

        _ = memberClient;
    }

    [Fact]
    public async Task Project_delete_removes_project_and_follow_up_read_returns_not_found()
    {
        await factory.ResetDatabaseAsync();
        using var adminClient = await CreateAuthorizedClientAsync("admin@test.local");

        var project = await CreateProjectAsync(adminClient, "Integration delete project");
        var details = await GetJsonAsync<ProjectDetailsResponse>(
            adminClient,
            $"/api/v1/projects/{project.Id}");
        var dashboard = await GetJsonAsync<ProjectDashboardResponse>(
            adminClient,
            $"/api/v1/projects/{project.Id}/dashboard?page=1&pageSize=10");

        var deleteResponse = await adminClient.DeleteAsync($"/api/v1/projects/{project.Id}");
        var projectAfterDeleteResponse = await adminClient.GetAsync($"/api/v1/projects/{project.Id}");

        Assert.Equal(project.Id, details.Id);
        Assert.Equal(project.Id, dashboard.Project.Id);
        Assert.Equal(HttpStatusCode.NoContent, deleteResponse.StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, projectAfterDeleteResponse.StatusCode);
    }

    [Fact]
    public async Task Comment_flow_creates_lists_updates_and_deletes_comments()
    {
        await factory.ResetDatabaseAsync();
        using var adminClient = await CreateAuthorizedClientAsync("admin@test.local");

        var project = await CreateProjectAsync(adminClient, "Integration comments");
        var suggestion = await CreateSuggestionAsync(adminClient, project.Id, "Discuss comment flow");

        var createdComment = await PostJsonAsync<CommentResponse>(
            adminClient,
            $"/api/v1/projects/{project.Id}/suggestions/{suggestion.Id}/comments",
            new CreateCommentRequest { Text = "Первый комментарий" });
        var comments = await GetJsonAsync<List<CommentResponse>>(
            adminClient,
            $"/api/v1/projects/{project.Id}/suggestions/{suggestion.Id}/comments");
        var updatedComment = await PatchJsonAsync<CommentResponse>(
            adminClient,
            $"/api/v1/projects/{project.Id}/comments/{createdComment.Id}",
            new UpdateCommentRequest { Text = "Обновлённый комментарий" });

        var deleteResponse = await adminClient.DeleteAsync(
            $"/api/v1/projects/{project.Id}/comments/{createdComment.Id}");
        var commentsAfterDelete = await GetJsonAsync<List<CommentResponse>>(
            adminClient,
            $"/api/v1/projects/{project.Id}/suggestions/{suggestion.Id}/comments");

        Assert.Single(comments);
        Assert.Equal(createdComment.Id, comments[0].Id);
        Assert.Equal("Обновлённый комментарий", updatedComment.Text);
        Assert.Equal(HttpStatusCode.NoContent, deleteResponse.StatusCode);
        Assert.Empty(commentsAfterDelete);
    }

    [Fact]
    public async Task Draft_flow_upserts_lists_and_deletes_suggestion_and_comment_drafts()
    {
        await factory.ResetDatabaseAsync();
        using var adminClient = await CreateAuthorizedClientAsync("admin@test.local");

        var project = await CreateProjectAsync(adminClient, "Integration drafts");
        var suggestion = await CreateSuggestionAsync(adminClient, project.Id, "Draft target suggestion");
        var suggestionDraftId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
        var commentDraftId = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb");

        var suggestionDraft = await PutJsonAsync<DraftResponse>(
            adminClient,
            $"/api/v1/projects/{project.Id}/drafts/suggestion/{suggestionDraftId}",
            new UpsertSuggestionDraftRequest { Text = "Черновик предложения" });
        var commentDraft = await PutJsonAsync<DraftResponse>(
            adminClient,
            $"/api/v1/projects/{project.Id}/drafts/comment/{commentDraftId}",
            new UpsertCommentDraftRequest
            {
                SuggestionId = suggestion.Id,
                ParentCommentId = null,
                Text = "Черновик комментария"
            });
        var drafts = await GetJsonAsync<PagedResponse<DraftResponse>>(
            adminClient,
            $"/api/v1/projects/{project.Id}/drafts?page=1&pageSize=20");

        var deleteResponse = await adminClient.DeleteAsync(
            $"/api/v1/projects/{project.Id}/drafts/{suggestionDraftId}");
        var draftsAfterDelete = await GetJsonAsync<PagedResponse<DraftResponse>>(
            adminClient,
            $"/api/v1/projects/{project.Id}/drafts?page=1&pageSize=20");

        Assert.Equal(DraftType.Suggestion, suggestionDraft.Type);
        Assert.Equal("Черновик предложения", suggestionDraft.Payload.GetProperty("text").GetString());
        Assert.Equal(DraftType.Comment, commentDraft.Type);
        Assert.Equal("Черновик комментария", commentDraft.Payload.GetProperty("text").GetString());
        Assert.Contains(drafts.Items, draft => draft.Id == suggestionDraftId);
        Assert.Contains(drafts.Items, draft => draft.Id == commentDraftId);
        Assert.Equal(HttpStatusCode.NoContent, deleteResponse.StatusCode);
        Assert.DoesNotContain(draftsAfterDelete.Items, draft => draft.Id == suggestionDraftId);
    }

    [Fact]
    public async Task Last_admin_cannot_demote_self_or_leave_project()
    {
        await factory.ResetDatabaseAsync();
        using var adminClient = await CreateAuthorizedClientAsync("admin@test.local");

        var project = await CreateProjectAsync(adminClient, "Integration last admin");

        var demoteResponse = await adminClient.PatchAsJsonAsync(
            $"/api/v1/projects/{project.Id}/members/{AdminUserId}",
            new UpdateProjectMemberRoleRequest { Role = ProjectRole.Member },
            JsonOptions);
        var leaveResponse = await adminClient.DeleteAsync(
            $"/api/v1/projects/{project.Id}/members/me");

        Assert.Equal(HttpStatusCode.Conflict, demoteResponse.StatusCode);
        Assert.Equal(HttpStatusCode.Conflict, leaveResponse.StatusCode);
    }

    private static async Task<ProjectSummaryResponse> CreateProjectAsync(HttpClient client, string name) =>
        await PostJsonAsync<ProjectSummaryResponse>(
            client,
            "/api/v1/projects",
            new CreateProjectRequest { Name = name, Description = "Created by integration test" });

    private static async Task<ProjectMemberResponse> AddMemberAsync(
        HttpClient client,
        Guid projectId,
        Guid userId,
        ProjectRole role) =>
        await PostJsonAsync<ProjectMemberResponse>(
            client,
            $"/api/v1/projects/{projectId}/members",
            new AddProjectMemberRequest { UserId = userId, Role = role });

    private static async Task<SuggestionSummaryResponse> CreateSuggestionAsync(
        HttpClient client,
        Guid projectId,
        string text) =>
        await PostJsonAsync<SuggestionSummaryResponse>(
            client,
            $"/api/v1/projects/{projectId}/suggestions",
            new CreateSuggestionRequest { Text = text });

    private async Task<HttpClient> CreateAuthorizedClientAsync(string email)
    {
        var client = CreateClientWithCookies();
        var login = await PostJsonAsync<AuthResponse>(
            client,
            "/api/v1/auth/login",
            new LoginRequest { Email = email, Password = "password" });
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", login.AccessToken);

        return client;
    }

    private HttpClient CreateClientWithCookies() =>
        factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = true });

    private static async Task<T> GetJsonAsync<T>(HttpClient client, string requestUri)
    {
        var response = await client.GetAsync(requestUri);
        return await ReadSuccessAsync<T>(response);
    }

    private static async Task<T> PostJsonAsync<T>(HttpClient client, string requestUri, object? value)
    {
        var response = await client.PostAsJsonAsync(requestUri, value, JsonOptions);
        return await ReadSuccessAsync<T>(response);
    }

    private static async Task<T> PutJsonAsync<T>(HttpClient client, string requestUri, object value)
    {
        var response = await client.PutAsJsonAsync(requestUri, value, JsonOptions);
        return await ReadSuccessAsync<T>(response);
    }

    private static async Task<T> PatchJsonAsync<T>(HttpClient client, string requestUri, object value)
    {
        var response = await client.PatchAsJsonAsync(requestUri, value, JsonOptions);
        return await ReadSuccessAsync<T>(response);
    }

    private static async Task<T> ReadSuccessAsync<T>(HttpResponseMessage response)
    {
        var body = await response.Content.ReadAsStringAsync();
        Assert.True(response.IsSuccessStatusCode, $"Expected success but got {(int)response.StatusCode}: {body}");

        var result = JsonSerializer.Deserialize<T>(body, JsonOptions);
        Assert.NotNull(result);

        return result;
    }
}
