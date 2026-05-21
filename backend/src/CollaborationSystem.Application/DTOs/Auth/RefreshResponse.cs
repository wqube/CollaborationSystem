namespace CollaborationSystem.Application.DTOs.Auth;

/// <summary>
/// Authentication result returned after refresh token rotation.
/// </summary>
public sealed class RefreshResponse
{
    /// <summary>
    /// New JWT access token used in the Authorization header.
    /// </summary>
    public string AccessToken { get; set; } = string.Empty;

    /// <summary>
    /// Access token lifetime in seconds.
    /// </summary>
    public int ExpiresIn { get; set; }

    /// <summary>
    /// Authenticated user profile.
    /// </summary>
    public UserDto User { get; set; } = null!;
}
