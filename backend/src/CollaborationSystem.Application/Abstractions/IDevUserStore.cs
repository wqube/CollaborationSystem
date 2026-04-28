using CollaborationSystem.Application.Auth;

namespace CollaborationSystem.Application.Abstractions;

public interface IDevUserStore
{
    Task<DevUser?> FindByIdAsync(Guid userId, CancellationToken cancellationToken = default);

    Task<DevUser?> ValidateCredentialsAsync(
        string email,
        string password,
        CancellationToken cancellationToken = default);
}
