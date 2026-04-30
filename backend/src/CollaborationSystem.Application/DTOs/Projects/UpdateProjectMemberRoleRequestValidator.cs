using FluentValidation;

namespace CollaborationSystem.Application.DTOs.Projects;

public sealed class UpdateProjectMemberRoleRequestValidator : AbstractValidator<UpdateProjectMemberRoleRequest>
{
    public UpdateProjectMemberRoleRequestValidator()
    {
        RuleFor(x => x.Role)
            .IsInEnum();
    }
}
