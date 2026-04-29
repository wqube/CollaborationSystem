using CollaborationSystem.Application.DTOs.Suggestions;
using CollaborationSystem.Application.DTOs.Users;

namespace CollaborationSystem.Application.Abstractions;

public interface IUserDirectoryService
{
    Task<PagedResponse<UserListItemResponse>> GetUsersAsync(
        GetUsersQuery query,
        CancellationToken cancellationToken = default);
}
