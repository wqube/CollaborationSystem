namespace CollaborationSystem.Application.DTOs.Suggestions;

/// <summary>
/// Generic paged API response.
/// </summary>
public sealed class PagedResponse<T>
{
    /// <summary>
    /// Items on the current page.
    /// </summary>
    public IReadOnlyList<T> Items { get; set; } = [];

    /// <summary>
    /// Current one-based page number.
    /// </summary>
    public int Page { get; set; }

    /// <summary>
    /// Number of items requested per page.
    /// </summary>
    public int PageSize { get; set; }

    /// <summary>
    /// Total number of items that match the query.
    /// </summary>
    public int Total { get; set; }
}
