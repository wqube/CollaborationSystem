using CollaborationSystem.Application.Abstractions;
using CollaborationSystem.Application.DTOs.Suggestions;
using CollaborationSystem.Domain.Entities;
using CollaborationSystem.Domain.Enums;
using CollaborationSystem.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace CollaborationSystem.Infrastructure.Suggestions;

public sealed class SuggestionService(
    AppDbContext dbContext,
    ICurrentUserService currentUserService) : ISuggestionService
{
    public async Task<SuggestionOperationResult<PagedResponse<SuggestionSummaryResponse>>> GetSuggestionsAsync(
        Guid projectId,
        GetSuggestionsQuery query,
        CancellationToken cancellationToken = default)
    {
        if (!await ProjectExistsAsync(projectId, cancellationToken))
        {
            return SuggestionOperationResult<PagedResponse<SuggestionSummaryResponse>>.Failure(
                SuggestionOperationStatus.ProjectNotFound);
        }

        var currentUserId = currentUserService.GetRequiredUserId();

        if (!await IsCurrentUserProjectMemberAsync(projectId, currentUserId, cancellationToken))
        {
            return SuggestionOperationResult<PagedResponse<SuggestionSummaryResponse>>.Failure(
                SuggestionOperationStatus.Forbidden);
        }

        var suggestionsQuery = dbContext.Suggestions
            .AsNoTracking()
            .Where(x => x.ProjectId == projectId);

        if (query.Status.HasValue)
        {
            suggestionsQuery = suggestionsQuery.Where(x => x.Status == query.Status.Value);
        }

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var search = query.Search.Trim().ToLower();
            suggestionsQuery = suggestionsQuery.Where(x => x.Text.ToLower().Contains(search));
        }

        var projectedQuery = suggestionsQuery.Select(x => new SuggestionListProjection
        {
            Id = x.Id,
            ProjectId = x.ProjectId,
            Text = x.Text,
            Status = x.Status,
            AuthorId = x.AuthorId,
            AuthorDisplayName = x.Author == null ? string.Empty : x.Author.DisplayName,
            Score = x.Votes.Count(v => v.VoteType == VoteType.Up) -
                    x.Votes.Count(v => v.VoteType == VoteType.Down),
            CreatedAtUtc = x.CreatedAtUtc,
            UpdatedAtUtc = x.UpdatedAtUtc
        });

        projectedQuery = ApplySorting(projectedQuery, query);

        var total = await projectedQuery.CountAsync(cancellationToken);
        var page = query.Page;
        var pageSize = query.PageSize;

        var items = await projectedQuery
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new SuggestionSummaryResponse
            {
                Id = x.Id,
                ProjectId = x.ProjectId,
                Text = x.Text,
                Status = x.Status,
                Author = new SuggestionAuthorResponse
                {
                    Id = x.AuthorId,
                    DisplayName = x.AuthorDisplayName
                },
                Score = x.Score,
                CreatedAt = x.CreatedAtUtc,
                UpdatedAt = x.UpdatedAtUtc
            })
            .ToListAsync(cancellationToken);

        return SuggestionOperationResult<PagedResponse<SuggestionSummaryResponse>>.Success(
            new PagedResponse<SuggestionSummaryResponse>
            {
                Items = items,
                Page = page,
                PageSize = pageSize,
                Total = total
            });
    }

    public async Task<SuggestionOperationResult<SuggestionSummaryResponse>> CreateSuggestionAsync(
        Guid projectId,
        CreateSuggestionRequest request,
        CancellationToken cancellationToken = default)
    {
        if (!await ProjectExistsAsync(projectId, cancellationToken))
        {
            return SuggestionOperationResult<SuggestionSummaryResponse>.Failure(
                SuggestionOperationStatus.ProjectNotFound);
        }

        var currentUserId = currentUserService.GetRequiredUserId();

        if (!await IsCurrentUserProjectMemberAsync(projectId, currentUserId, cancellationToken))
        {
            return SuggestionOperationResult<SuggestionSummaryResponse>.Failure(
                SuggestionOperationStatus.Forbidden);
        }

        var author = await dbContext.UsersProfile
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == currentUserId, cancellationToken);

        if (author is null)
        {
            return SuggestionOperationResult<SuggestionSummaryResponse>.Failure(
                SuggestionOperationStatus.UserNotFound);
        }

        var suggestion = new Suggestion
        {
            ProjectId = projectId,
            AuthorId = currentUserId,
            Text = request.Text.Trim(),
            Status = SuggestionStatus.New
        };

        dbContext.Suggestions.Add(suggestion);
        await dbContext.SaveChangesAsync(cancellationToken);

        return SuggestionOperationResult<SuggestionSummaryResponse>.Success(
            ToSummaryResponse(suggestion, author, score: 0));
    }

    public async Task<SuggestionOperationResult<SuggestionDetailsResponse>> GetSuggestionByIdAsync(
        Guid projectId,
        Guid suggestionId,
        CancellationToken cancellationToken = default)
    {
        if (!await ProjectExistsAsync(projectId, cancellationToken))
        {
            return SuggestionOperationResult<SuggestionDetailsResponse>.Failure(
                SuggestionOperationStatus.ProjectNotFound);
        }

        var currentUserId = currentUserService.GetRequiredUserId();

        if (!await IsCurrentUserProjectMemberAsync(projectId, currentUserId, cancellationToken))
        {
            return SuggestionOperationResult<SuggestionDetailsResponse>.Failure(
                SuggestionOperationStatus.Forbidden);
        }

        var suggestion = await GetSuggestionWithDetailsAsync(projectId, suggestionId, cancellationToken);

        if (suggestion is null)
        {
            return SuggestionOperationResult<SuggestionDetailsResponse>.Failure(
                SuggestionOperationStatus.SuggestionNotFound);
        }

        if (suggestion.Author is null)
        {
            return SuggestionOperationResult<SuggestionDetailsResponse>.Failure(
                SuggestionOperationStatus.UserNotFound);
        }

        return SuggestionOperationResult<SuggestionDetailsResponse>.Success(
            ToDetailsResponse(suggestion, currentUserId));
    }

    public async Task<SuggestionOperationResult<SuggestionSummaryResponse>> UpdateSuggestionTextAsync(
        Guid projectId,
        Guid suggestionId,
        UpdateSuggestionRequest request,
        CancellationToken cancellationToken = default)
    {
        if (!await ProjectExistsAsync(projectId, cancellationToken))
        {
            return SuggestionOperationResult<SuggestionSummaryResponse>.Failure(
                SuggestionOperationStatus.ProjectNotFound);
        }

        var currentUserId = currentUserService.GetRequiredUserId();

        if (!await IsCurrentUserProjectMemberAsync(projectId, currentUserId, cancellationToken))
        {
            return SuggestionOperationResult<SuggestionSummaryResponse>.Failure(
                SuggestionOperationStatus.Forbidden);
        }

        var suggestion = await GetSuggestionWithDetailsAsync(projectId, suggestionId, cancellationToken);

        if (suggestion is null)
        {
            return SuggestionOperationResult<SuggestionSummaryResponse>.Failure(
                SuggestionOperationStatus.SuggestionNotFound);
        }

        if (suggestion.AuthorId != currentUserId)
        {
            return SuggestionOperationResult<SuggestionSummaryResponse>.Failure(
                SuggestionOperationStatus.Forbidden);
        }

        if (suggestion.Author is null)
        {
            return SuggestionOperationResult<SuggestionSummaryResponse>.Failure(
                SuggestionOperationStatus.UserNotFound);
        }

        suggestion.Text = request.Text.Trim();
        suggestion.UpdatedAtUtc = DateTime.UtcNow;

        await dbContext.SaveChangesAsync(cancellationToken);

        return SuggestionOperationResult<SuggestionSummaryResponse>.Success(
            ToSummaryResponse(suggestion, suggestion.Author, CalculateScore(suggestion.Votes)));
    }

    public async Task<SuggestionOperationResult<SuggestionSummaryResponse>> UpdateSuggestionStatusAsync(
        Guid projectId,
        Guid suggestionId,
        UpdateSuggestionStatusRequest request,
        CancellationToken cancellationToken = default)
    {
        if (!await ProjectExistsAsync(projectId, cancellationToken))
        {
            return SuggestionOperationResult<SuggestionSummaryResponse>.Failure(
                SuggestionOperationStatus.ProjectNotFound);
        }

        var currentUserId = currentUserService.GetRequiredUserId();

        if (!await IsCurrentUserProjectAdminAsync(projectId, currentUserId, cancellationToken))
        {
            return SuggestionOperationResult<SuggestionSummaryResponse>.Failure(
                SuggestionOperationStatus.Forbidden);
        }

        var suggestion = await GetSuggestionWithDetailsAsync(projectId, suggestionId, cancellationToken);

        if (suggestion is null)
        {
            return SuggestionOperationResult<SuggestionSummaryResponse>.Failure(
                SuggestionOperationStatus.SuggestionNotFound);
        }

        if (suggestion.Author is null)
        {
            return SuggestionOperationResult<SuggestionSummaryResponse>.Failure(
                SuggestionOperationStatus.UserNotFound);
        }

        suggestion.Status = request.Status;
        suggestion.UpdatedAtUtc = DateTime.UtcNow;

        await dbContext.SaveChangesAsync(cancellationToken);

        return SuggestionOperationResult<SuggestionSummaryResponse>.Success(
            ToSummaryResponse(suggestion, suggestion.Author, CalculateScore(suggestion.Votes)));
    }

    private async Task<bool> ProjectExistsAsync(Guid projectId, CancellationToken cancellationToken) =>
        await dbContext.Projects
            .AsNoTracking()
            .AnyAsync(x => x.Id == projectId, cancellationToken);

    private async Task<bool> IsCurrentUserProjectMemberAsync(
        Guid projectId,
        Guid currentUserId,
        CancellationToken cancellationToken)
    {
        if (currentUserId == Guid.Empty)
        {
            return false;
        }

        return await dbContext.ProjectMembers
            .AsNoTracking()
            .AnyAsync(
                x => x.ProjectId == projectId && x.UserId == currentUserId,
                cancellationToken);
    }

    private async Task<bool> IsCurrentUserProjectAdminAsync(
        Guid projectId,
        Guid currentUserId,
        CancellationToken cancellationToken)
    {
        if (currentUserId == Guid.Empty)
        {
            return false;
        }

        return await dbContext.ProjectMembers
            .AsNoTracking()
            .AnyAsync(
                x => x.ProjectId == projectId &&
                     x.UserId == currentUserId &&
                     x.Role == ProjectRole.Admin,
                cancellationToken);
    }

    private async Task<Suggestion?> GetSuggestionWithDetailsAsync(
        Guid projectId,
        Guid suggestionId,
        CancellationToken cancellationToken) =>
        await dbContext.Suggestions
            .Include(x => x.Author)
            .Include(x => x.Votes)
            .ThenInclude(x => x.User)
            .FirstOrDefaultAsync(
                x => x.ProjectId == projectId && x.Id == suggestionId,
                cancellationToken);

    private static IQueryable<SuggestionListProjection> ApplySorting(
        IQueryable<SuggestionListProjection> query,
        GetSuggestionsQuery request)
    {
        var sort = request.Sort?.Trim().ToLowerInvariant();
        var order = request.Order?.Trim().ToLowerInvariant();
        var descending = order == "desc";

        return sort switch
        {
            "createdat" => descending
                ? query.OrderByDescending(x => x.CreatedAtUtc)
                : query.OrderBy(x => x.CreatedAtUtc),
            "updatedat" => descending
                ? query.OrderByDescending(x => x.UpdatedAtUtc)
                : query.OrderBy(x => x.UpdatedAtUtc),
            "score" => descending
                ? query.OrderByDescending(x => x.Score).ThenBy(x => x.CreatedAtUtc)
                : query.OrderBy(x => x.Score).ThenBy(x => x.CreatedAtUtc),
            _ => query.OrderByDescending(x => x.Score).ThenBy(x => x.CreatedAtUtc)
        };
    }

    private static SuggestionSummaryResponse ToSummaryResponse(
        Suggestion suggestion,
        AppUser author,
        int score) =>
        new()
        {
            Id = suggestion.Id,
            ProjectId = suggestion.ProjectId,
            Text = suggestion.Text,
            Status = suggestion.Status,
            Author = new SuggestionAuthorResponse
            {
                Id = author.Id,
                DisplayName = author.DisplayName
            },
            Score = score,
            CreatedAt = suggestion.CreatedAtUtc,
            UpdatedAt = suggestion.UpdatedAtUtc
        };

    private static SuggestionDetailsResponse ToDetailsResponse(
        Suggestion suggestion,
        Guid currentUserId)
    {
        var votes = suggestion.Votes
            .OrderBy(x => x.CreatedAtUtc)
            .Select(x => new VoteBreakdownItemResponse
            {
                UserId = x.UserId,
                DisplayName = x.User?.DisplayName ?? string.Empty,
                VoteType = x.VoteType,
                CreatedAt = x.CreatedAtUtc
            })
            .ToArray();

        return new SuggestionDetailsResponse
        {
            Id = suggestion.Id,
            ProjectId = suggestion.ProjectId,
            Text = suggestion.Text,
            Status = suggestion.Status,
            Author = new SuggestionAuthorResponse
            {
                Id = suggestion.AuthorId,
                DisplayName = suggestion.Author?.DisplayName ?? string.Empty
            },
            Score = CalculateScore(suggestion.Votes),
            CurrentUserVote = suggestion.Votes
                .FirstOrDefault(x => x.UserId == currentUserId)
                ?.VoteType,
            CreatedAt = suggestion.CreatedAtUtc,
            UpdatedAt = suggestion.UpdatedAtUtc,
            Votes = votes
        };
    }

    private static int CalculateScore(IEnumerable<Vote> votes) =>
        votes.Count(x => x.VoteType == VoteType.Up) -
        votes.Count(x => x.VoteType == VoteType.Down);

    private sealed class SuggestionListProjection
    {
        public Guid Id { get; init; }

        public Guid ProjectId { get; init; }

        public string Text { get; init; } = string.Empty;

        public SuggestionStatus Status { get; init; }

        public Guid AuthorId { get; init; }

        public string AuthorDisplayName { get; init; } = string.Empty;

        public int Score { get; init; }

        public DateTime CreatedAtUtc { get; init; }

        public DateTime UpdatedAtUtc { get; init; }
    }
}
