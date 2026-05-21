using FluentValidation;

namespace CollaborationSystem.Application.DTOs.Projects;

public sealed class CreateProjectMeetingRequestValidator : AbstractValidator<CreateProjectMeetingRequest>
{
    public CreateProjectMeetingRequestValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty()
            .MaximumLength(200);

        RuleFor(x => x.StartsAtUtc)
            .NotEmpty();

        RuleFor(x => x.EndsAtUtc)
            .GreaterThan(x => x.StartsAtUtc)
            .When(x => x.EndsAtUtc.HasValue);

        RuleFor(x => x.Location)
            .MaximumLength(300);

        RuleFor(x => x.Agenda)
            .MaximumLength(4000);
    }
}
