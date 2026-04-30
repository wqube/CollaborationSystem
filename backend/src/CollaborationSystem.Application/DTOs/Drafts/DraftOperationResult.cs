namespace CollaborationSystem.Application.DTOs.Drafts;

public sealed class DraftOperationResult<T>
{
    private DraftOperationResult(DraftOperationStatus status, T? value = default)
    {
        Status = status;
        Value = value;
    }

    public DraftOperationStatus Status { get; }

    public T? Value { get; }

    public static DraftOperationResult<T> Success(T value) => new(DraftOperationStatus.Success, value);

    public static DraftOperationResult<T> Failure(DraftOperationStatus status) => new(status);
}
