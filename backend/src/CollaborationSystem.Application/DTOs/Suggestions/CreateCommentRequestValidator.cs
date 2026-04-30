using FluentValidation;

namespace CollaborationSystem.Application.DTOs.Suggestions;

public sealed class CreateCommentRequestValidator : AbstractValidator<CreateCommentRequest>
{
    public CreateCommentRequestValidator()
    {
        RuleFor(x => x.Text)
            .NotEmpty()
            .MaximumLength(4000);
    }
}
