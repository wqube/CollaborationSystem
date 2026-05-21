using CollaborationSystem.Domain.Enums;

namespace CollaborationSystem.Application.DTOs.Projects;

/// <summary>
/// Query parameters for project dashboard suggestions.
/// </summary>
public sealed class GetProjectDashboardQuery
{
    /// <summary>
    /// Optional suggestion status filter.
    /// </summary>
    public SuggestionStatus? Status { get; set; }

    /// <summary>
    /// One-based suggestion page number.
    /// </summary>
    public int Page { get; set; } = 1;

    /// <summary>
    /// Number of suggestions per page.
    /// </summary>
    public int PageSize { get; set; } = 10;
}
