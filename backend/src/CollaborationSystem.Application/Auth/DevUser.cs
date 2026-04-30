namespace CollaborationSystem.Application.Auth;

public sealed record DevUser(
    Guid Id,
    string Email,
    string DisplayName,
    string DomainLogin);
