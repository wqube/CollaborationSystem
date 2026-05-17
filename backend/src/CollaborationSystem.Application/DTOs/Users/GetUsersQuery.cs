namespace CollaborationSystem.Application.DTOs.Users;

/// <summary>
/// Query parameters for user directory search.
/// </summary>
public sealed class GetUsersQuery
{
    /// <summary>
    /// Optional search text matched against user names and emails.
    /// </summary>
    public string? Search { get; set; }

    /// <summary>
    /// One-based page number.
    /// </summary>
    public int Page { get; set; } = 1;

    /// <summary>
    /// Number of users per page.
    /// </summary>
    public int PageSize { get; set; } = 20;
}
