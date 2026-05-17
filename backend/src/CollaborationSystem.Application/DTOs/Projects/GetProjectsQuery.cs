namespace CollaborationSystem.Application.DTOs.Projects;

/// <summary>
/// Query parameters for listing projects.
/// </summary>
public sealed class GetProjectsQuery
{
    /// <summary>
    /// One-based page number.
    /// </summary>
    public int Page { get; set; } = 1;

    /// <summary>
    /// Number of projects per page.
    /// </summary>
    public int PageSize { get; set; } = 20;
}
