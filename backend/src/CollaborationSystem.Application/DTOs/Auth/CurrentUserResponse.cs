namespace CollaborationSystem.Application.DTOs.Auth;

public sealed class CurrentUserResponse
{
    public Guid Id { get; set; }
    public string DisplayName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string AuthMode { get; set; } = string.Empty;
}
