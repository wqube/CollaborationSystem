using CollaborationSystem.Application.DTOs;

namespace CollaborationSystem.Application.DTOs.Auth;

/// <summary>
/// Authentication result returned after a successful login.
/// </summary>
public sealed class AuthResponse
{
    /// <summary>
    /// JWT access token used in the Authorization header.
    /// </summary>
    public string AccessToken { get; set; } = string.Empty;

    /// <summary>
    /// Access token lifetime in seconds.
    /// </summary>
    public int ExpiresIn { get; set; }

    /// <summary>
    /// Authenticated user profile.
    /// </summary>
    public UserDto User { get; set; } = new();
}
