using System.ComponentModel.DataAnnotations;

namespace CollaborationSystem.Application.DTOs.Suggestions;

public sealed class CreateSuggestionRequest
{
    [Required]
    [MaxLength(4000)]
    public string Text { get; set; } = string.Empty;
}
