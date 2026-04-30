using FluentValidation;

namespace CollaborationSystem.Application.DTOs.Drafts;

public sealed class GetDraftsQueryValidator : AbstractValidator<GetDraftsQuery>
{
    public GetDraftsQueryValidator()
    {
        RuleFor(x => x.Page)
            .GreaterThanOrEqualTo(1);

        RuleFor(x => x.PageSize)
            .InclusiveBetween(1, 100);
    }
}
