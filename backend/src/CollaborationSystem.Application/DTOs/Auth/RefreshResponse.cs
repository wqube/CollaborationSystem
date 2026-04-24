namespace CollaborationSystem.Application.DTOs.Auth;

public sealed class RefreshResponse
{
    public string AccessToken { get; set; } = string.Empty;
    public int ExpiresIn { get; set; }
}
