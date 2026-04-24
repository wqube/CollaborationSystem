namespace CollaborationSystem.Application.Abstractions;

public interface ICurrentUserService
{
    Guid GetRequiredUserId();
    string? GetDisplayName();
    string? GetEmail();
}
