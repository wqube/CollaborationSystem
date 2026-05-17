namespace CollaborationSystem.Application.DTOs.Suggestions;

public enum SuggestionOperationStatus
{
    Success = 1,
    Forbidden = 2,
    ProjectNotFound = 3,
    SuggestionNotFound = 4,
    UserNotFound = 5,
    InvalidRequest = 6,
    Conflict = 7,
    CommentNotFound = 8,
    VoteLimitExceeded = 9,
    SuggestionAlreadyExists = 10
}
