using FluentValidation;

namespace CollaborationSystem.Application.DTOs.Suggestions;

public sealed class UpdateSuggestionStatusRequestValidator : AbstractValidator<UpdateSuggestionStatusRequest>
{
    public UpdateSuggestionStatusRequestValidator()
    {
        RuleFor(x => x.Status)
            .IsInEnum();
    }
}
