namespace CollaborationSystem.Application.DTOs.Users;

public sealed class GetUsersQuery
{
    public string? Search { get; set; }

    public int Page { get; set; } = 1;

    public int PageSize { get; set; } = 20;
}
