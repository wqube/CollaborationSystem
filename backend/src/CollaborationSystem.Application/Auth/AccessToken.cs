namespace CollaborationSystem.Application.Auth;

public sealed record AccessToken(
    string Token,
    int ExpiresIn);
