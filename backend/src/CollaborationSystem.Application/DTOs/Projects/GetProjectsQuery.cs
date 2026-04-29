namespace CollaborationSystem.Application.DTOs.Projects;

public sealed class GetProjectsQuery
{
    public int Page { get; set; } = 1;

    public int PageSize { get; set; } = 20;
}
