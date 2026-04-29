using CollaborationSystem.Domain.Enums;

namespace CollaborationSystem.Application.DTOs.Projects;

public sealed class AddProjectMemberRequest
{
    public Guid UserId { get; set; }

    public ProjectRole Role { get; set; } = ProjectRole.Member;
}
