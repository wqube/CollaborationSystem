namespace CollaborationSystem.Application.DTOs.Users;

/// <summary>
/// User item returned from the user directory.
/// </summary>
public sealed class UserListItemResponse
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
