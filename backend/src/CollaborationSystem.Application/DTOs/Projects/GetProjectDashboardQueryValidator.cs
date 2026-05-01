using FluentValidation;

namespace CollaborationSystem.Application.DTOs.Projects;

public sealed class GetProjectDashboardQueryValidator : AbstractValidator<GetProjectDashboardQuery>
{
    public GetProjectDashboardQueryValidator()
    {
        RuleFor(x => x.Page)
            .GreaterThan(0);

        RuleFor(x => x.PageSize)
            .InclusiveBetween(1, 100);
    }
}
