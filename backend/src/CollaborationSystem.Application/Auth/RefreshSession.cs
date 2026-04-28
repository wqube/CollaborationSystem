namespace CollaborationSystem.Application.Auth;

public sealed record RefreshSession(
    Guid UserId,
    DateTime ExpiresAtUtc);
