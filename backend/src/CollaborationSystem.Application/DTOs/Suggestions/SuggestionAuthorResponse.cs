namespace CollaborationSystem.Application.DTOs.Suggestions;

/// <summary>
/// Author data shown with suggestions and comments.
/// </summary>
public sealed class SuggestionAuthorResponse
{
    /// <summary>
    /// Author user identifier.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Author display name.
    /// </summary>
    public string DisplayName { get; set; } = string.Empty;
}
