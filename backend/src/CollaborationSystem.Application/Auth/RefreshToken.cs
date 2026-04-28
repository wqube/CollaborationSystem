namespace CollaborationSystem.Application.Auth;

public sealed record RefreshToken(
    string Token,
    DateTime ExpiresAtUtc);
