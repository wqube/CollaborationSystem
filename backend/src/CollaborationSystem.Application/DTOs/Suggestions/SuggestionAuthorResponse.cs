namespace CollaborationSystem.Application.DTOs.Suggestions;

public sealed class SuggestionAuthorResponse
{
    public Guid Id { get; set; }

    public string DisplayName { get; set; } = string.Empty;
}
