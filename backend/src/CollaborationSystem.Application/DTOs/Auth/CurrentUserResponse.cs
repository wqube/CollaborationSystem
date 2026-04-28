using CollaborationSystem.Application.DTOs;

namespace CollaborationSystem.Application.DTOs.Auth;

public sealed class CurrentUserResponse : UserDto
{
    public string AuthMode { get; set; } = string.Empty;
}
