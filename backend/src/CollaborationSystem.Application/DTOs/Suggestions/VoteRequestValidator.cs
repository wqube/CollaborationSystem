using FluentValidation;

namespace CollaborationSystem.Application.DTOs.Suggestions;

public sealed class VoteRequestValidator : AbstractValidator<VoteRequest>
{
    public VoteRequestValidator()
    {
        RuleFor(x => x.VoteType)
            .IsInEnum();
    }
}
