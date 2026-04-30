namespace CollaborationSystem.Application.DTOs.Projects;

public sealed class ProjectMemberOperationResult
{
    private ProjectMemberOperationResult(
        ProjectMemberOperationStatus status,
        ProjectMemberResponse? member = null)
    {
        Status = status;
        Member = member;
    }

    public ProjectMemberOperationStatus Status { get; }

    public ProjectMemberResponse? Member { get; }

    public static ProjectMemberOperationResult Success(ProjectMemberResponse? member = null) =>
        new(ProjectMemberOperationStatus.Success, member);

    public static ProjectMemberOperationResult Failure(ProjectMemberOperationStatus status) =>
        new(status);
}
