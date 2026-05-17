namespace CollaborationSystem.Application.DTOs.Auth;

/// <summary>
/// Credentials for development user login.
/// </summary>
public sealed class LoginRequest
{
    /// <summary>
    /// User email address.
    /// </summary>
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// User password.
    /// </summary>
    public string Password { get; set; } = string.Empty;
}
