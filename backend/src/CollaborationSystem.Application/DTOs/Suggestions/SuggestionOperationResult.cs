namespace CollaborationSystem.Application.DTOs.Suggestions;

public sealed class SuggestionOperationResult<T>
{
    private SuggestionOperationResult(SuggestionOperationStatus status, T? value = default)
    {
        Status = status;
        Value = value;
    }

    public SuggestionOperationStatus Status { get; }

    public T? Value { get; }

    public static SuggestionOperationResult<T> Success(T value) =>
        new(SuggestionOperationStatus.Success, value);

    public static SuggestionOperationResult<T> Failure(SuggestionOperationStatus status) =>
        new(status);
}
