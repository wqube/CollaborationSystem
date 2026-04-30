namespace CollaborationSystem.Application.DTOs.Projects;

public enum ProjectMemberOperationStatus
{
    Success = 1,
    Forbidden = 2,
    ProjectNotFound = 3,
    UserNotFound = 4,
    MemberAlreadyExists = 5,
    MemberNotFound = 6
}
