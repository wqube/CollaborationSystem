using CollaborationSystem.Application.DTOs.Suggestions;

namespace CollaborationSystem.Application.DTOs.Projects;

public sealed class ProjectDashboardResponse
{
    public ProjectDashboardProjectResponse Project { get; set; } = new();

    public IReadOnlyList<ProjectMemberPreviewResponse> MembersPreview { get; set; } = [];

    public PagedResponse<SuggestionSummaryResponse> Suggestions { get; set; } = new();
}
