using CollaborationSystem.Application.DTOs.Suggestions;

namespace CollaborationSystem.Application.DTOs.Projects;

/// <summary>
/// Aggregated project dashboard data.
/// </summary>
public sealed class ProjectDashboardResponse
{
    /// <summary>
    /// Project metadata.
    /// </summary>
    public ProjectDashboardProjectResponse Project { get; set; } = new();

    /// <summary>
    /// Project voting settings.
    /// </summary>
    public ProjectVoteSettingsResponse VoteSettings { get; set; } = new();

    /// <summary>
    /// Current user's vote quota.
    /// </summary>
    public CurrentUserVoteQuotaResponse CurrentUserVoteQuota { get; set; } = new();

    /// <summary>
    /// Preview of project members.
    /// </summary>
    public IReadOnlyList<ProjectMemberPreviewResponse> MembersPreview { get; set; } = [];

    /// <summary>
    /// Paged suggestions shown on the dashboard.
    /// </summary>
    public PagedResponse<SuggestionSummaryResponse> Suggestions { get; set; } = new();
}
