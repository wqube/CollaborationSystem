using Microsoft.AspNetCore.Identity;

namespace CollaborationSystem.Infrastructure.Identity;

public class ApplicationIdentityUser : IdentityUser<Guid>
{
    public string DisplayName { get; set; } = string.Empty;
}
