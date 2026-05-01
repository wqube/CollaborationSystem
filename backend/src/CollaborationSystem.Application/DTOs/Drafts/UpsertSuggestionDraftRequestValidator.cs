using FluentValidation;

namespace CollaborationSystem.Application.DTOs.Drafts;

public sealed class UpsertSuggestionDraftRequestValidator : AbstractValidator<UpsertSuggestionDraftRequest>
{
    public UpsertSuggestionDraftRequestValidator()
    {
        RuleFor(x => x.Text)
            .NotEmpty()
            .MaximumLength(5000);
    }
}
