using CollaborationSystem.Domain.Common;

namespace CollaborationSystem.Domain.Entities;

public class RefreshSession : BaseEntity
{
    public Guid UserId { get; set; }
    public string RefreshTokenHash { get; set; } = string.Empty;
    public DateTime ExpiresAtUtc { get; set; }
    public DateTime? RevokedAtUtc { get; set; }

    public AppUser? User { get; set; }
}
