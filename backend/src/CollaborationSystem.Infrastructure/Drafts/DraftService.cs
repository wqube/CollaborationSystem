using CollaborationSystem.Application.Abstractions;
using CollaborationSystem.Application.DTOs.Drafts;
using CollaborationSystem.Application.DTOs.Suggestions;
using CollaborationSystem.Domain.Entities;
using CollaborationSystem.Domain.Enums;
using CollaborationSystem.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace CollaborationSystem.Infrastructure.Drafts;

public sealed class DraftService(
    AppDbContext dbContext,
    ICurrentUserService currentUserService) : IDraftService
{
    public async Task<DraftOperationResult<PagedResponse<DraftResponse>>> GetDraftsAsync(
        Guid projectId,
        GetDraftsQuery query,
        CancellationToken cancellationToken = default)
    {
        var accessStatus = await GetAccessStatusAsync(projectId, cancellationToken);
        if (accessStatus != DraftOperationStatus.Success)
        {
            return DraftOperationResult<PagedResponse<DraftResponse>>.Failure(accessStatus);
        }

        var currentUserId = currentUserService.GetRequiredUserId();
        var draftsQuery = dbContext.Drafts
            .AsNoTracking()
            .Where(x => x.ProjectId == projectId && x.UserId == currentUserId);

        if (query.Type.HasValue)
        {
            draftsQuery = draftsQuery.Where(x => x.Type == query.Type.Value);
        }

        var total = await draftsQuery.CountAsync(cancellationToken);
        var rawItems = await draftsQuery
            .OrderByDescending(x => x.UpdatedAtUtc)
            .ThenByDescending(x => x.CreatedAtUtc)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(x => new
            {
                x.Id,
                x.ProjectId,
                x.Type,
                x.PayloadJson,
                x.UpdatedAtUtc
            })
            .ToListAsync(cancellationToken);

        var items = rawItems
            .Select(x => new DraftResponse
            {
                Id = x.Id,
                ProjectId = x.ProjectId,
                Type = x.Type,
                Payload = DeserializePayload(x.PayloadJson),
                UpdatedAt = x.UpdatedAtUtc
            })
            .ToList();

        return DraftOperationResult<PagedResponse<DraftResponse>>.Success(new PagedResponse<DraftResponse>
        {
            Items = items,
            Page = query.Page,
            PageSize = query.PageSize,
            Total = total
        });
    }

    public async Task<DraftOperationResult<DraftResponse>> UpsertSuggestionDraftAsync(
        Guid projectId,
        Guid draftId,
        UpsertSuggestionDraftRequest request,
        CancellationToken cancellationToken = default)
    {
        var accessStatus = await GetAccessStatusAsync(projectId, cancellationToken);
        if (accessStatus != DraftOperationStatus.Success)
        {
            return DraftOperationResult<DraftResponse>.Failure(accessStatus);
        }

        var currentUserId = currentUserService.GetRequiredUserId();
        var payloadJson = JsonSerializer.Serialize(new { text = request.Text.Trim() });
        var upsertResult = await UpsertDraftAsync(
            projectId,
            draftId,
            currentUserId,
            DraftType.Suggestion,
            suggestionId: null,
            parentCommentId: null,
            payloadJson,
            cancellationToken);

        return upsertResult;
    }

    public async Task<DraftOperationResult<DraftResponse>> UpsertCommentDraftAsync(
        Guid projectId,
        Guid draftId,
        UpsertCommentDraftRequest request,
        CancellationToken cancellationToken = default)
    {
        var accessStatus = await GetAccessStatusAsync(projectId, cancellationToken);
        if (accessStatus != DraftOperationStatus.Success)
        {
            return DraftOperationResult<DraftResponse>.Failure(accessStatus);
        }

        var suggestionExists = await dbContext.Suggestions
            .AsNoTracking()
            .AnyAsync(
                x => x.Id == request.SuggestionId && x.ProjectId == projectId,
                cancellationToken);

        if (!suggestionExists)
        {
            return DraftOperationResult<DraftResponse>.Failure(DraftOperationStatus.InvalidRequest);
        }

        if (request.ParentCommentId.HasValue)
        {
            var commentExists = await dbContext.Comments
                .AsNoTracking()
                .AnyAsync(
                    x => x.Id == request.ParentCommentId.Value &&
                         x.ProjectId == projectId &&
                         x.DeletedAtUtc == null,
                    cancellationToken);

            if (!commentExists)
            {
                return DraftOperationResult<DraftResponse>.Failure(DraftOperationStatus.InvalidRequest);
            }
        }

        var currentUserId = currentUserService.GetRequiredUserId();
        var payloadJson = JsonSerializer.Serialize(new
        {
            suggestionId = request.SuggestionId,
            parentCommentId = request.ParentCommentId,
            text = request.Text.Trim()
        });
        var upsertResult = await UpsertDraftAsync(
            projectId,
            draftId,
            currentUserId,
            DraftType.Comment,
            request.SuggestionId,
            request.ParentCommentId,
            payloadJson,
            cancellationToken);

        return upsertResult;
    }

    public async Task<DraftOperationResult<bool>> DeleteDraftAsync(
        Guid projectId,
        Guid draftId,
        CancellationToken cancellationToken = default)
    {
        var accessStatus = await GetAccessStatusAsync(projectId, cancellationToken);
        if (accessStatus != DraftOperationStatus.Success)
        {
            return DraftOperationResult<bool>.Failure(accessStatus);
        }

        var currentUserId = currentUserService.GetRequiredUserId();
        var draft = await dbContext.Drafts
            .FirstOrDefaultAsync(x => x.Id == draftId, cancellationToken);

        if (draft is null)
        {
            return DraftOperationResult<bool>.Failure(DraftOperationStatus.DraftNotFound);
        }

        if (draft.ProjectId != projectId || draft.UserId != currentUserId)
        {
            return DraftOperationResult<bool>.Failure(DraftOperationStatus.Forbidden);
        }

        dbContext.Drafts.Remove(draft);
        await dbContext.SaveChangesAsync(cancellationToken);

        return DraftOperationResult<bool>.Success(true);
    }

    private async Task<DraftOperationResult<DraftResponse>> UpsertDraftAsync(
        Guid projectId,
        Guid draftId,
        Guid currentUserId,
        DraftType type,
        Guid? suggestionId,
        Guid? parentCommentId,
        string payloadJson,
        CancellationToken cancellationToken)
    {
        var draft = await dbContext.Drafts.FirstOrDefaultAsync(x => x.Id == draftId, cancellationToken);
        var utcNow = DateTime.UtcNow;

        if (draft is null)
        {
            draft = new Draft
            {
                Id = draftId,
                ProjectId = projectId,
                UserId = currentUserId,
                Type = type,
                SuggestionId = suggestionId,
                ParentCommentId = parentCommentId,
                PayloadJson = payloadJson,
                CreatedAtUtc = utcNow,
                UpdatedAtUtc = utcNow
            };

            dbContext.Drafts.Add(draft);
        }
        else
        {
            if (draft.ProjectId != projectId || draft.UserId != currentUserId)
            {
                return DraftOperationResult<DraftResponse>.Failure(DraftOperationStatus.Forbidden);
            }

            if (draft.Type != type)
            {
                return DraftOperationResult<DraftResponse>.Failure(DraftOperationStatus.InvalidRequest);
            }

            draft.SuggestionId = suggestionId;
            draft.ParentCommentId = parentCommentId;
            draft.PayloadJson = payloadJson;
            draft.UpdatedAtUtc = utcNow;
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        return DraftOperationResult<DraftResponse>.Success(ToResponse(draft));
    }

    private async Task<DraftOperationStatus> GetAccessStatusAsync(
        Guid projectId,
        CancellationToken cancellationToken)
    {
        var projectExists = await dbContext.Projects
            .AsNoTracking()
            .AnyAsync(x => x.Id == projectId, cancellationToken);

        if (!projectExists)
        {
            return DraftOperationStatus.ProjectNotFound;
        }

        var currentUserId = currentUserService.GetRequiredUserId();
        if (currentUserId == Guid.Empty)
        {
            return DraftOperationStatus.Forbidden;
        }

        var isMember = await dbContext.ProjectMembers
            .AsNoTracking()
            .AnyAsync(
                x => x.ProjectId == projectId && x.UserId == currentUserId,
                cancellationToken);

        return isMember ? DraftOperationStatus.Success : DraftOperationStatus.Forbidden;
    }

    private static DraftResponse ToResponse(Draft draft) =>
        new()
        {
            Id = draft.Id,
            ProjectId = draft.ProjectId,
            Type = draft.Type,
            Payload = DeserializePayload(draft.PayloadJson),
            UpdatedAt = draft.UpdatedAtUtc
        };

    private static JsonElement DeserializePayload(string payloadJson)
    {
        try
        {
            return JsonDocument.Parse(payloadJson).RootElement;
        }
        catch (JsonException)
        {
            return JsonDocument.Parse("{}").RootElement;
        }
    }
}
