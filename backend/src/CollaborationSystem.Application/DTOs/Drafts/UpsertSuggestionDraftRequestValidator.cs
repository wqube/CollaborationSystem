using FluentValidation;

namespace CollaborationSystem.Application.DTOs.Drafts;

public sealed class UpsertSuggestionDraftRequestValidator : AbstractValidator<UpsertSuggestionDraftRequest>
{
    public UpsertSuggestionDraftRequestValidator()
    {
        RuleFor(x => x.Payload.ValueKind)
            .NotEqual(System.Text.Json.JsonValueKind.Undefined)
            .WithMessage("'Payload' is required.");

        RuleFor(x => x.Payload.ValueKind)
            .NotEqual(System.Text.Json.JsonValueKind.Null)
            .WithMessage("'Payload' cannot be null.");
    }
}
