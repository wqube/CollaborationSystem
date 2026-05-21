using CollaborationSystem.Application.Abstractions;
using CollaborationSystem.Application.DTOs.Suggestions;
using CollaborationSystem.Domain.Entities;
using CollaborationSystem.Domain.Enums;
using CollaborationSystem.Infrastructure.Persistence;
using CollaborationSystem.Infrastructure.Projects;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using System.Text.RegularExpressions;

namespace CollaborationSystem.Infrastructure.Suggestions;

public sealed class SuggestionService(
    AppDbContext dbContext,
    ICurrentUserService currentUserService,
    VoteQuotaService voteQuotaService) : ISuggestionService
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
            CurrentUserVote = x.Votes
                .Where(v => v.UserId == currentUserId)
                .Select(v => (VoteType?)v.VoteType)
                .FirstOrDefault(),
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
                CurrentUserVote = x.CurrentUserVote,
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

        var text = request.Text.Trim();
        var normalizedText = NormalizeText(text);
        var suggestionExists = await dbContext.Suggestions
            .AsNoTracking()
            .AnyAsync(
                x => x.ProjectId == projectId && x.NormalizedText == normalizedText,
                cancellationToken);

        if (suggestionExists)
        {
            return SuggestionOperationResult<SuggestionSummaryResponse>.Failure(
                SuggestionOperationStatus.SuggestionAlreadyExists);
        }

        var suggestion = new Suggestion
        {
            ProjectId = projectId,
            AuthorId = currentUserId,
            Text = text,
            NormalizedText = normalizedText,
            Status = SuggestionStatus.New
        };

        dbContext.Suggestions.Add(suggestion);
        try
        {
            await dbContext.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException exception) when (IsUniqueViolation(exception, "UX_Suggestions_ProjectId_NormalizedText"))
        {
            return SuggestionOperationResult<SuggestionSummaryResponse>.Failure(
                SuggestionOperationStatus.SuggestionAlreadyExists);
        }

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

        var text = request.Text.Trim();
        var normalizedText = NormalizeText(text);
        var suggestionExists = await dbContext.Suggestions
            .AsNoTracking()
            .AnyAsync(
                x => x.ProjectId == projectId &&
                     x.Id != suggestionId &&
                     x.NormalizedText == normalizedText,
                cancellationToken);

        if (suggestionExists)
        {
            return SuggestionOperationResult<SuggestionSummaryResponse>.Failure(
                SuggestionOperationStatus.SuggestionAlreadyExists);
        }

        suggestion.Text = text;
        suggestion.NormalizedText = normalizedText;
        suggestion.UpdatedAtUtc = DateTime.UtcNow;

        try
        {
            await dbContext.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException exception) when (IsUniqueViolation(exception, "UX_Suggestions_ProjectId_NormalizedText"))
        {
            return SuggestionOperationResult<SuggestionSummaryResponse>.Failure(
                SuggestionOperationStatus.SuggestionAlreadyExists);
        }

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

    public async Task<SuggestionOperationResult<VoteResponse>> SetVoteAsync(
        Guid projectId,
        Guid suggestionId,
        VoteRequest request,
        CancellationToken cancellationToken = default)
    {
        if (!await ProjectExistsAsync(projectId, cancellationToken))
        {
            return SuggestionOperationResult<VoteResponse>.Failure(SuggestionOperationStatus.ProjectNotFound);
        }

        var currentUserId = currentUserService.GetRequiredUserId();

        var member = await dbContext.ProjectMembers
            .Include(x => x.Project)
            .FirstOrDefaultAsync(
                x => x.ProjectId == projectId && x.UserId == currentUserId,
                cancellationToken);

        if (member is null)
        {
            return SuggestionOperationResult<VoteResponse>.Failure(SuggestionOperationStatus.Forbidden);
        }

        var project = member.Project!;
        var utcNow = DateTime.UtcNow;
        voteQuotaService.ApplyLazyReset(project, member, utcNow);

        var suggestionExists = await dbContext.Suggestions
            .AsNoTracking()
            .AnyAsync(x => x.Id == suggestionId && x.ProjectId == projectId, cancellationToken);

        if (!suggestionExists)
        {
            return SuggestionOperationResult<VoteResponse>.Failure(SuggestionOperationStatus.SuggestionNotFound);
        }

        var existingVote = await dbContext.Votes
            .FirstOrDefaultAsync(
                x => x.SuggestionId == suggestionId && x.UserId == currentUserId,
                cancellationToken);

        if (existingVote is null)
        {
            if (member.VotesRemaining <= 0)
            {
                await dbContext.SaveChangesAsync(cancellationToken);

                return SuggestionOperationResult<VoteResponse>.Failure(
                    SuggestionOperationStatus.VoteLimitExceeded,
                    voteQuotaService.ToResponse(project, member));
            }

            dbContext.Votes.Add(new Vote
            {
                SuggestionId = suggestionId,
                UserId = currentUserId,
                VoteType = request.VoteType,
                BudgetPeriodStartedAtUtc = member.VotePeriodStartedAtUtc,
                CreatedAtUtc = utcNow,
                UpdatedAtUtc = utcNow
            });

            member.VotesRemaining -= 1;
            member.UpdatedAtUtc = utcNow;
        }
        else if (existingVote.VoteType != request.VoteType)
        {
            existingVote.VoteType = request.VoteType;
            existingVote.UpdatedAtUtc = utcNow;
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        var score = await GetSuggestionScoreAsync(suggestionId, cancellationToken);

        return SuggestionOperationResult<VoteResponse>.Success(new VoteResponse
        {
            SuggestionId = suggestionId,
            CurrentUserVote = request.VoteType,
            Score = score,
            VoteQuota = voteQuotaService.ToResponse(project, member)
        });
    }

    public async Task<SuggestionOperationResult<VoteResponse>> RemoveVoteAsync(
        Guid projectId,
        Guid suggestionId,
        CancellationToken cancellationToken = default)
    {
        if (!await ProjectExistsAsync(projectId, cancellationToken))
        {
            return SuggestionOperationResult<VoteResponse>.Failure(SuggestionOperationStatus.ProjectNotFound);
        }

        var currentUserId = currentUserService.GetRequiredUserId();

        var member = await dbContext.ProjectMembers
            .Include(x => x.Project)
            .FirstOrDefaultAsync(
                x => x.ProjectId == projectId && x.UserId == currentUserId,
                cancellationToken);

        if (member is null)
        {
            return SuggestionOperationResult<VoteResponse>.Failure(SuggestionOperationStatus.Forbidden);
        }

        var project = member.Project!;
        var utcNow = DateTime.UtcNow;
        voteQuotaService.ApplyLazyReset(project, member, utcNow);

        var suggestionExists = await dbContext.Suggestions
            .AsNoTracking()
            .AnyAsync(x => x.Id == suggestionId && x.ProjectId == projectId, cancellationToken);

        if (!suggestionExists)
        {
            return SuggestionOperationResult<VoteResponse>.Failure(SuggestionOperationStatus.SuggestionNotFound);
        }

        var existingVote = await dbContext.Votes
            .FirstOrDefaultAsync(
                x => x.SuggestionId == suggestionId && x.UserId == currentUserId,
                cancellationToken);

        if (existingVote is not null)
        {
            if (existingVote.BudgetPeriodStartedAtUtc == member.VotePeriodStartedAtUtc)
            {
                member.VotesRemaining = Math.Min(project.VotesPerUser, member.VotesRemaining + 1);
                member.UpdatedAtUtc = utcNow;
            }

            dbContext.Votes.Remove(existingVote);
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        var score = await GetSuggestionScoreAsync(suggestionId, cancellationToken);

        return SuggestionOperationResult<VoteResponse>.Success(new VoteResponse
        {
            SuggestionId = suggestionId,
            CurrentUserVote = null,
            Score = score,
            VoteQuota = voteQuotaService.ToResponse(project, member)
        });
    }

    public async Task<SuggestionOperationResult<IReadOnlyList<CommentResponse>>> GetCommentsAsync(
        Guid projectId,
        Guid suggestionId,
        CancellationToken cancellationToken = default)
    {
        if (!await ProjectExistsAsync(projectId, cancellationToken))
        {
            return SuggestionOperationResult<IReadOnlyList<CommentResponse>>.Failure(
                SuggestionOperationStatus.ProjectNotFound);
        }

        var currentUserId = currentUserService.GetRequiredUserId();

        if (!await IsCurrentUserProjectMemberAsync(projectId, currentUserId, cancellationToken))
        {
            return SuggestionOperationResult<IReadOnlyList<CommentResponse>>.Failure(
                SuggestionOperationStatus.Forbidden);
        }

        var suggestionExists = await dbContext.Suggestions
            .AsNoTracking()
            .AnyAsync(x => x.Id == suggestionId && x.ProjectId == projectId, cancellationToken);

        if (!suggestionExists)
        {
            return SuggestionOperationResult<IReadOnlyList<CommentResponse>>.Failure(
                SuggestionOperationStatus.SuggestionNotFound);
        }

        var comments = await dbContext.Comments
            .AsNoTracking()
            .Where(x =>
                x.ProjectId == projectId &&
                x.SuggestionId == suggestionId &&
                x.DeletedAtUtc == null)
            .OrderBy(x => x.CreatedAtUtc)
            .Select(x => new CommentResponse
            {
                Id = x.Id,
                ProjectId = x.ProjectId,
                SuggestionId = x.SuggestionId,
                ParentCommentId = x.ParentCommentId,
                Text = x.Text,
                Author = new SuggestionAuthorResponse
                {
                    Id = x.AuthorId,
                    DisplayName = x.Author == null ? string.Empty : x.Author.DisplayName
                },
                CreatedAt = x.CreatedAtUtc,
                UpdatedAt = x.UpdatedAtUtc
            })
            .ToListAsync(cancellationToken);

        return SuggestionOperationResult<IReadOnlyList<CommentResponse>>.Success(comments);
    }

    public async Task<SuggestionOperationResult<CommentResponse>> CreateCommentAsync(
        Guid projectId,
        Guid suggestionId,
        CreateCommentRequest request,
        CancellationToken cancellationToken = default)
    {
        if (!await ProjectExistsAsync(projectId, cancellationToken))
        {
            return SuggestionOperationResult<CommentResponse>.Failure(SuggestionOperationStatus.ProjectNotFound);
        }

        var currentUserId = currentUserService.GetRequiredUserId();

        if (!await IsCurrentUserProjectMemberAsync(projectId, currentUserId, cancellationToken))
        {
            return SuggestionOperationResult<CommentResponse>.Failure(SuggestionOperationStatus.Forbidden);
        }

        var suggestionExists = await dbContext.Suggestions
            .AsNoTracking()
            .AnyAsync(x => x.Id == suggestionId && x.ProjectId == projectId, cancellationToken);

        if (!suggestionExists)
        {
            return SuggestionOperationResult<CommentResponse>.Failure(SuggestionOperationStatus.SuggestionNotFound);
        }

        var author = await dbContext.UsersProfile
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == currentUserId, cancellationToken);

        if (author is null)
        {
            return SuggestionOperationResult<CommentResponse>.Failure(SuggestionOperationStatus.UserNotFound);
        }

        if (request.ParentCommentId.HasValue)
        {
            var parentExists = await dbContext.Comments
                .AsNoTracking()
                .AnyAsync(x =>
                    x.Id == request.ParentCommentId.Value &&
                    x.ProjectId == projectId &&
                    x.SuggestionId == suggestionId &&
                    x.DeletedAtUtc == null,
                    cancellationToken);

            if (!parentExists)
            {
                return SuggestionOperationResult<CommentResponse>.Failure(SuggestionOperationStatus.InvalidRequest);
            }
        }

        var comment = new Comment
        {
            ProjectId = projectId,
            SuggestionId = suggestionId,
            AuthorId = currentUserId,
            ParentCommentId = request.ParentCommentId,
            Text = request.Text.Trim()
        };

        dbContext.Comments.Add(comment);
        await dbContext.SaveChangesAsync(cancellationToken);

        return SuggestionOperationResult<CommentResponse>.Success(new CommentResponse
        {
            Id = comment.Id,
            ProjectId = comment.ProjectId,
            SuggestionId = comment.SuggestionId,
            ParentCommentId = comment.ParentCommentId,
            Text = comment.Text,
            Author = new SuggestionAuthorResponse
            {
                Id = author.Id,
                DisplayName = author.DisplayName
            },
            CreatedAt = comment.CreatedAtUtc,
            UpdatedAt = comment.UpdatedAtUtc
        });
    }

    public async Task<SuggestionOperationResult<CommentResponse>> UpdateCommentAsync(
        Guid projectId,
        Guid commentId,
        UpdateCommentRequest request,
        CancellationToken cancellationToken = default)
    {
        if (!await ProjectExistsAsync(projectId, cancellationToken))
        {
            return SuggestionOperationResult<CommentResponse>.Failure(SuggestionOperationStatus.ProjectNotFound);
        }

        var currentUserId = currentUserService.GetRequiredUserId();

        if (!await IsCurrentUserProjectMemberAsync(projectId, currentUserId, cancellationToken))
        {
            return SuggestionOperationResult<CommentResponse>.Failure(SuggestionOperationStatus.Forbidden);
        }

        var comment = await dbContext.Comments
            .Include(x => x.Author)
            .FirstOrDefaultAsync(
                x => x.Id == commentId && x.ProjectId == projectId && x.DeletedAtUtc == null,
                cancellationToken);

        if (comment is null)
        {
            return SuggestionOperationResult<CommentResponse>.Failure(SuggestionOperationStatus.CommentNotFound);
        }

        if (comment.AuthorId != currentUserId)
        {
            return SuggestionOperationResult<CommentResponse>.Failure(SuggestionOperationStatus.Forbidden);
        }

        comment.Text = request.Text.Trim();
        comment.UpdatedAtUtc = DateTime.UtcNow;

        await dbContext.SaveChangesAsync(cancellationToken);

        return SuggestionOperationResult<CommentResponse>.Success(new CommentResponse
        {
            Id = comment.Id,
            ProjectId = comment.ProjectId,
            SuggestionId = comment.SuggestionId,
            ParentCommentId = comment.ParentCommentId,
            Text = comment.Text,
            Author = new SuggestionAuthorResponse
            {
                Id = comment.AuthorId,
                DisplayName = comment.Author?.DisplayName ?? string.Empty
            },
            CreatedAt = comment.CreatedAtUtc,
            UpdatedAt = comment.UpdatedAtUtc
        });
    }

    public async Task<SuggestionOperationResult<bool>> DeleteCommentAsync(
        Guid projectId,
        Guid commentId,
        CancellationToken cancellationToken = default)
    {
        if (!await ProjectExistsAsync(projectId, cancellationToken))
        {
            return SuggestionOperationResult<bool>.Failure(SuggestionOperationStatus.ProjectNotFound);
        }

        var currentUserId = currentUserService.GetRequiredUserId();

        if (!await IsCurrentUserProjectMemberAsync(projectId, currentUserId, cancellationToken))
        {
            return SuggestionOperationResult<bool>.Failure(SuggestionOperationStatus.Forbidden);
        }

        var comment = await dbContext.Comments
            .FirstOrDefaultAsync(
                x => x.Id == commentId && x.ProjectId == projectId && x.DeletedAtUtc == null,
                cancellationToken);

        if (comment is null)
        {
            return SuggestionOperationResult<bool>.Failure(SuggestionOperationStatus.CommentNotFound);
        }

        if (comment.AuthorId != currentUserId)
        {
            return SuggestionOperationResult<bool>.Failure(SuggestionOperationStatus.Forbidden);
        }

        comment.DeletedAtUtc = DateTime.UtcNow;
        comment.UpdatedAtUtc = DateTime.UtcNow;
        comment.Text = string.Empty;

        await dbContext.SaveChangesAsync(cancellationToken);

        return SuggestionOperationResult<bool>.Success(true);
    }

    private async Task<bool> ProjectExistsAsync(Guid projectId, CancellationToken cancellationToken) =>
        await dbContext.Projects
            .AsNoTracking()
            .AnyAsync(x => x.Id == projectId && x.DeletedAtUtc == null, cancellationToken);

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

    private static string NormalizeText(string text) =>
        Regex.Replace(text.Trim(), @"\s+", " ").ToLowerInvariant();

    private static bool IsUniqueViolation(DbUpdateException exception, string constraintName) =>
        exception.InnerException is PostgresException postgresException &&
        postgresException.SqlState == PostgresErrorCodes.UniqueViolation &&
        postgresException.ConstraintName == constraintName;

    private async Task<int> GetSuggestionScoreAsync(Guid suggestionId, CancellationToken cancellationToken)
    {
        var upVotes = await dbContext.Votes
            .AsNoTracking()
            .CountAsync(
                x => x.SuggestionId == suggestionId && x.VoteType == VoteType.Up,
                cancellationToken);

        var downVotes = await dbContext.Votes
            .AsNoTracking()
            .CountAsync(
                x => x.SuggestionId == suggestionId && x.VoteType == VoteType.Down,
                cancellationToken);

        return upVotes - downVotes;
    }

    private sealed class SuggestionListProjection
    {
        public Guid Id { get; init; }

        public Guid ProjectId { get; init; }

        public string Text { get; init; } = string.Empty;

        public SuggestionStatus Status { get; init; }

        public Guid AuthorId { get; init; }

        public string AuthorDisplayName { get; init; } = string.Empty;

        public int Score { get; init; }

        public VoteType? CurrentUserVote { get; init; }

        public DateTime CreatedAtUtc { get; init; }

        public DateTime UpdatedAtUtc { get; init; }
    }
}
