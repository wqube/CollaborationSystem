using FluentValidation;

namespace CollaborationSystem.Application.DTOs.Suggestions;

public sealed class UpdateCommentRequestValidator : AbstractValidator<UpdateCommentRequest>
{
    public UpdateCommentRequestValidator()
    {
        RuleFor(x => x.Text)
            .NotEmpty()
            .MaximumLength(4000);
    }
}
