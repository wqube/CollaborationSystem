using System.ComponentModel.DataAnnotations;

namespace CollaborationSystem.Application.DTOs.Auth;

public sealed class RefreshTokenRequest
{
    [Required]
    public string RefreshToken { get; set; } = string.Empty;
}
