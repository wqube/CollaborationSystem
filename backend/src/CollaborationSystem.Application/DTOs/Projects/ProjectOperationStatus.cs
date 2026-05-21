namespace CollaborationSystem.Application.DTOs.Projects;

public enum ProjectOperationStatus
{
    Success = 0,
    Forbidden = 1,
    ProjectNotFound = 2,
    Conflict = 3,
    ProjectMeetingNotFound = 4
}
