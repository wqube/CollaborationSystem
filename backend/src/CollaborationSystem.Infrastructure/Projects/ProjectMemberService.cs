using CollaborationSystem.Application.Abstractions;
using CollaborationSystem.Application.DTOs.Projects;
using CollaborationSystem.Domain.Entities;
using CollaborationSystem.Domain.Enums;
using CollaborationSystem.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace CollaborationSystem.Infrastructure.Projects;

public sealed class ProjectMemberService(
    AppDbContext dbContext,
    ICurrentUserService currentUserService) : IProjectMemberService
{
    public async Task<ProjectMemberOperationResult> AddMemberAsync(
        Guid projectId,
        AddProjectMemberRequest request,
        CancellationToken cancellationToken = default)
    {
        var projectExists = await dbContext.Projects
            .AnyAsync(x => x.Id == projectId, cancellationToken);

        if (!projectExists)
        {
            return ProjectMemberOperationResult.Failure(ProjectMemberOperationStatus.ProjectNotFound);
        }

        if (!await IsCurrentUserProjectAdminAsync(projectId, cancellationToken))
        {
            return ProjectMemberOperationResult.Failure(ProjectMemberOperationStatus.Forbidden);
        }

        var user = await dbContext.UsersProfile
            .FirstOrDefaultAsync(x => x.Id == request.UserId, cancellationToken);

        if (user is null)
        {
            return ProjectMemberOperationResult.Failure(ProjectMemberOperationStatus.UserNotFound);
        }

        var memberAlreadyExists = await dbContext.ProjectMembers
            .AnyAsync(x => x.ProjectId == projectId && x.UserId == request.UserId, cancellationToken);

        if (memberAlreadyExists)
        {
            return ProjectMemberOperationResult.Failure(ProjectMemberOperationStatus.MemberAlreadyExists);
        }

        var member = new ProjectMember
        {
            ProjectId = projectId,
            UserId = request.UserId,
            Role = request.Role
        };

        dbContext.ProjectMembers.Add(member);
        await dbContext.SaveChangesAsync(cancellationToken);

        return ProjectMemberOperationResult.Success(ToResponse(member, user));
    }

    public async Task<ProjectMemberOperationResult> UpdateMemberRoleAsync(
        Guid projectId,
        Guid userId,
        UpdateProjectMemberRoleRequest request,
        CancellationToken cancellationToken = default)
    {
        var projectExists = await dbContext.Projects
            .AnyAsync(x => x.Id == projectId, cancellationToken);

        if (!projectExists)
        {
            return ProjectMemberOperationResult.Failure(ProjectMemberOperationStatus.ProjectNotFound);
        }

        if (!await IsCurrentUserProjectAdminAsync(projectId, cancellationToken))
        {
            return ProjectMemberOperationResult.Failure(ProjectMemberOperationStatus.Forbidden);
        }

        var member = await dbContext.ProjectMembers
            .Include(x => x.User)
            .FirstOrDefaultAsync(x => x.ProjectId == projectId && x.UserId == userId, cancellationToken);

        if (member is null)
        {
            return ProjectMemberOperationResult.Failure(ProjectMemberOperationStatus.MemberNotFound);
        }

        if (member.User is null)
        {
            return ProjectMemberOperationResult.Failure(ProjectMemberOperationStatus.UserNotFound);
        }

        if (member.Role == ProjectRole.Admin && request.Role != ProjectRole.Admin)
        {
            var adminCount = await dbContext.ProjectMembers
                .CountAsync(
                    x => x.ProjectId == projectId && x.Role == ProjectRole.Admin,
                    cancellationToken);

            if (adminCount <= 1)
            {
                return ProjectMemberOperationResult.Failure(ProjectMemberOperationStatus.LastProjectAdmin);
            }
        }

        member.Role = request.Role;
        member.UpdatedAtUtc = DateTime.UtcNow;

        await dbContext.SaveChangesAsync(cancellationToken);

        return ProjectMemberOperationResult.Success(ToResponse(member, member.User));
    }

    public async Task<ProjectMemberOperationResult> RemoveMemberAsync(
        Guid projectId,
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        var projectExists = await dbContext.Projects
            .AnyAsync(x => x.Id == projectId, cancellationToken);

        if (!projectExists)
        {
            return ProjectMemberOperationResult.Failure(ProjectMemberOperationStatus.ProjectNotFound);
        }

        if (!await IsCurrentUserProjectAdminAsync(projectId, cancellationToken))
        {
            return ProjectMemberOperationResult.Failure(ProjectMemberOperationStatus.Forbidden);
        }

        var member = await dbContext.ProjectMembers
            .FirstOrDefaultAsync(x => x.ProjectId == projectId && x.UserId == userId, cancellationToken);

        if (member is null)
        {
            return ProjectMemberOperationResult.Failure(ProjectMemberOperationStatus.MemberNotFound);
        }

        dbContext.ProjectMembers.Remove(member);
        await dbContext.SaveChangesAsync(cancellationToken);

        return ProjectMemberOperationResult.Success();
    }

    private async Task<bool> IsCurrentUserProjectAdminAsync(
        Guid projectId,
        CancellationToken cancellationToken)
    {
        var currentUserId = currentUserService.GetRequiredUserId();

        if (currentUserId == Guid.Empty)
        {
            return false;
        }

        return await dbContext.ProjectMembers
            .AnyAsync(
                x => x.ProjectId == projectId &&
                     x.UserId == currentUserId &&
                     x.Role == ProjectRole.Admin,
                cancellationToken);
    }

    private static ProjectMemberResponse ToResponse(ProjectMember member, AppUser user) =>
        new()
        {
            ProjectId = member.ProjectId,
            UserId = member.UserId,
            DisplayName = user.DisplayName,
            Email = user.Email,
            Role = member.Role,
            JoinedAt = member.JoinedAtUtc
        };
}
