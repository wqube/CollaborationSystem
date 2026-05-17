namespace CollaborationSystem.Application.DTOs.Auth;

/// <summary>
/// Current authenticated user profile.
/// </summary>
public sealed class CurrentUserResponse
{
    /// <summary>
    /// User identifier.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// User display name.
    /// </summary>
    public string DisplayName { get; set; } = string.Empty;

    /// <summary>
    /// User email address.
    /// </summary>
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// Authentication mode used for the current session.
    /// </summary>
    public string AuthMode { get; set; } = string.Empty;
}
