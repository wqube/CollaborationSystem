using FluentValidation;

namespace CollaborationSystem.Application.DTOs.Suggestions;

public sealed class GetSuggestionsQueryValidator : AbstractValidator<GetSuggestionsQuery>
{
    private static readonly string[] AllowedSortFields = ["createdAt", "updatedAt", "score"];
    private static readonly string[] AllowedOrders = ["asc", "desc"];

    public GetSuggestionsQueryValidator()
    {
        RuleFor(x => x.Page)
            .GreaterThanOrEqualTo(1);

        RuleFor(x => x.PageSize)
            .InclusiveBetween(1, 100);

        RuleFor(x => x.Sort)
            .Must(BeAllowedSortField)
            .When(x => !string.IsNullOrWhiteSpace(x.Sort))
            .WithMessage("'Sort' must be one of: createdAt, updatedAt, score.");

        RuleFor(x => x.Order)
            .Must(BeAllowedOrder)
            .When(x => !string.IsNullOrWhiteSpace(x.Order))
            .WithMessage("'Order' must be one of: asc, desc.");
    }

    private static bool BeAllowedSortField(string? sort) =>
        AllowedSortFields.Contains(sort, StringComparer.OrdinalIgnoreCase);

    private static bool BeAllowedOrder(string? order) =>
        AllowedOrders.Contains(order, StringComparer.OrdinalIgnoreCase);
}
