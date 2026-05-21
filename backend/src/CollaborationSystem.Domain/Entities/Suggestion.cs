using CollaborationSystem.Domain.Common;
using CollaborationSystem.Domain.Enums;

namespace CollaborationSystem.Domain.Entities;

public class Suggestion : BaseEntity
{
    public Guid ProjectId { get; set; }
    public Guid AuthorId { get; set; }
    public string Text { get; set; } = string.Empty;
    public string NormalizedText { get; set; } = string.Empty;
    public SuggestionStatus Status { get; set; } = SuggestionStatus.New;

    public Project? Project { get; set; }
    public AppUser? Author { get; set; }
    public ICollection<Vote> Votes { get; set; } = [];
    public ICollection<Comment> Comments { get; set; } = [];
}
