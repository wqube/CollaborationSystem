namespace CollaborationSystem.Application.DTOs.Suggestions;

public sealed class SuggestionOperationResult<T>
{
    private SuggestionOperationResult(
        SuggestionOperationStatus status,
        T? value = default,
        object? errorDetails = null)
    {
        Status = status;
        Value = value;
        ErrorDetails = errorDetails;
    }

    public SuggestionOperationStatus Status { get; }

    public T? Value { get; }

    public object? ErrorDetails { get; }

    public static SuggestionOperationResult<T> Success(T value) =>
        new(SuggestionOperationStatus.Success, value);

    public static SuggestionOperationResult<T> Failure(
        SuggestionOperationStatus status,
        object? errorDetails = null) =>
        new(status, errorDetails: errorDetails);
}
