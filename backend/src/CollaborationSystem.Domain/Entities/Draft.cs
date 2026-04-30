using CollaborationSystem.Domain.Common;
using CollaborationSystem.Domain.Enums;

namespace CollaborationSystem.Domain.Entities;

public class Draft : BaseEntity
{
    public Guid ProjectId { get; set; }
    public Guid UserId { get; set; }
    public DraftType Type { get; set; }
    public string PayloadJson { get; set; } = "{}";

    public Project? Project { get; set; }
    public AppUser? User { get; set; }
}
