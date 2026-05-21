using CollaborationSystem.Application.Abstractions;

namespace CollaborationSystem.Tests.TestSupport;

internal sealed class TestCurrentUserService(Guid currentUserId) : ICurrentUserService
{
    public Guid CurrentUserId { get; set; } = currentUserId;

    public Guid GetRequiredUserId() => CurrentUserId;

    public string? GetDisplayName() => "Test User";

    public string? GetEmail() => "test.user@example.com";

    public string? GetAuthMode() => "Test";
}
