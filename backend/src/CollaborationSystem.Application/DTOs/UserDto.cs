namespace CollaborationSystem.Application.DTOs;

/// <summary>
/// Basic user profile used in authentication responses.
/// </summary>
public sealed class UserDto
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
}
