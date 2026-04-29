namespace CollaborationSystem.Application.DTOs.Projects;

public sealed class ProjectOperationResult<T>
{
    public ProjectOperationStatus Status { get; private init; }

    public T? Value { get; private init; }

    public static ProjectOperationResult<T> Success(T value) =>
        new()
        {
            Status = ProjectOperationStatus.Success,
            Value = value
        };

    public static ProjectOperationResult<T> Failure(ProjectOperationStatus status) =>
        new()
        {
            Status = status
        };
}
