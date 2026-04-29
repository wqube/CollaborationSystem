using CollaborationSystem.Application.Abstractions;
using CollaborationSystem.Application.DTOs.Suggestions;
using CollaborationSystem.Application.DTOs.Users;
using CollaborationSystem.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace CollaborationSystem.Infrastructure.Users;

public sealed class UserDirectoryService(AppDbContext dbContext) : IUserDirectoryService
{
    public async Task<PagedResponse<UserListItemResponse>> GetUsersAsync(
        GetUsersQuery query,
        CancellationToken cancellationToken = default)
    {
        var usersQuery = dbContext.UsersProfile
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var search = query.Search.Trim().ToLowerInvariant();
            usersQuery = usersQuery.Where(x =>
                x.DisplayName.ToLower().Contains(search) ||
                x.Email.ToLower().Contains(search));
        }

        var total = await usersQuery.CountAsync(cancellationToken);
        var items = await usersQuery
            .OrderBy(x => x.DisplayName)
            .ThenBy(x => x.Email)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(x => new UserListItemResponse
            {
                Id = x.Id,
                DisplayName = x.DisplayName,
                Email = x.Email
            })
            .ToListAsync(cancellationToken);

        return new PagedResponse<UserListItemResponse>
        {
            Items = items,
            Page = query.Page,
            PageSize = query.PageSize,
            Total = total
        };
    }
}
