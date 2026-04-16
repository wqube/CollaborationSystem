using CollaborationSystem.Domain.Common;

namespace CollaborationSystem.Domain.Entities;

public class AppUser : BaseEntity
{
    public string Email { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string ExternalIdentityId { get; set; } = string.Empty;
    public int AvailableVotes { get; set; } = 3;
    public DateTime? VotesResetAtUtc { get; set; }

    public ICollection<ProjectMember> ProjectMemberships { get; set; } = [];
    public ICollection<Suggestion> Suggestions { get; set; } = [];
    public ICollection<Comment> Comments { get; set; } = [];
    public ICollection<Vote> Votes { get; set; } = [];
    public ICollection<Draft> Drafts { get; set; } = [];
}
