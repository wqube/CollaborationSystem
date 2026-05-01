using FluentValidation;

namespace CollaborationSystem.Application.DTOs.Drafts;

public sealed class UpsertCommentDraftRequestValidator : AbstractValidator<UpsertCommentDraftRequest>
{
    public UpsertCommentDraftRequestValidator()
    {
        RuleFor(x => x.SuggestionId)
            .NotEmpty();

        RuleFor(x => x.Text)
            .NotEmpty()
            .MaximumLength(5000);
    }
}
