using FluentValidation;

namespace CollaborationSystem.Application.DTOs.Suggestions;

public sealed class UpdateSuggestionRequestValidator : AbstractValidator<UpdateSuggestionRequest>
{
    public UpdateSuggestionRequestValidator()
    {
        RuleFor(x => x.Text)
            .NotEmpty()
            .MaximumLength(4000);
    }
}
