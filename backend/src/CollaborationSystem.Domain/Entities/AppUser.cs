using CollaborationSystem.Domain.Common;

namespace CollaborationSystem.Domain.Entities;

public class AppUser : BaseEntity
{
    public string Email { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string DomainLogin { get; set; } = string.Empty;

    public ICollection<ProjectMember> ProjectMemberships { get; set; } = [];
    public ICollection<Suggestion> Suggestions { get; set; } = [];
    public ICollection<Comment> Comments { get; set; } = [];
    public ICollection<Vote> Votes { get; set; } = [];
    public ICollection<Draft> Drafts { get; set; } = [];
    public ICollection<RefreshSession> RefreshSessions { get; set; } = [];
}
