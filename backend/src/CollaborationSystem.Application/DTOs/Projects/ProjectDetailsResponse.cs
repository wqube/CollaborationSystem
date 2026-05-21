namespace CollaborationSystem.Application.DTOs.Projects;

/// <summary>
/// Detailed project data.
/// </summary>
public sealed class ProjectDetailsResponse
{
    /// <summary>
    /// Project identifier.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Project name.
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Project description.
    /// </summary>
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// Identifier of the user who created the project.
    /// </summary>
    public Guid CreatedByUserId { get; set; }

    /// <summary>
    /// Project creation timestamp in UTC.
    /// </summary>
    public DateTime CreatedAtUtc { get; set; }

    /// <summary>
    /// Project update timestamp in UTC.
    /// </summary>
    public DateTime UpdatedAtUtc { get; set; }

    /// <summary>
    /// Project voting settings.
    /// </summary>
    public ProjectVoteSettingsResponse VoteSettings { get; set; } = new();

    /// <summary>
    /// Current user's vote quota.
    /// </summary>
    public CurrentUserVoteQuotaResponse CurrentUserVoteQuota { get; set; } = new();

    /// <summary>
    /// Project members.
    /// </summary>
    public IReadOnlyList<ProjectMemberResponse> Members { get; set; } = [];
}
