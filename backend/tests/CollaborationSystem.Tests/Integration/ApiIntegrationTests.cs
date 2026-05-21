using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using CollaborationSystem.Application.DTOs.Auth;
using CollaborationSystem.Application.DTOs.Projects;
using CollaborationSystem.Application.DTOs.Suggestions;
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
