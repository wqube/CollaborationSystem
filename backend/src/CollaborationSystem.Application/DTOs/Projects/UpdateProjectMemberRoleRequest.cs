using CollaborationSystem.Domain.Enums;

namespace CollaborationSystem.Application.DTOs.Projects;

public sealed class UpdateProjectMemberRoleRequest
{
    public ProjectRole Role { get; set; }
}
