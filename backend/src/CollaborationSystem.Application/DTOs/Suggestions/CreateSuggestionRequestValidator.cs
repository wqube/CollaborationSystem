using FluentValidation;

namespace CollaborationSystem.Application.DTOs.Suggestions;

public sealed class CreateSuggestionRequestValidator : AbstractValidator<CreateSuggestionRequest>
{
    public CreateSuggestionRequestValidator()
    {
        RuleFor(x => x.Text)
            .NotEmpty()
            .MaximumLength(4000);
    }
}
