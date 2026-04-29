namespace CollaborationSystem.Application.DTOs.Projects;

public sealed class ProjectDashboardResponse
{
    public ProjectDetailsResponse Project { get; set; } = new();

    public IReadOnlyList<SuggestionPreviewResponse> SuggestionsPreview { get; set; } = [];
}
