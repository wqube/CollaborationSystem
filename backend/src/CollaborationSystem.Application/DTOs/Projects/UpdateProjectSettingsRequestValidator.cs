using FluentValidation;

namespace CollaborationSystem.Application.DTOs.Projects;

public sealed class UpdateProjectSettingsRequestValidator : AbstractValidator<UpdateProjectSettingsRequest>
{
    public UpdateProjectSettingsRequestValidator()
    {
        RuleFor(x => x.VotesPerUser)
            .GreaterThanOrEqualTo(1);

        RuleFor(x => x.VoteResetPeriodDays)
            .GreaterThanOrEqualTo(1);
    }
}
