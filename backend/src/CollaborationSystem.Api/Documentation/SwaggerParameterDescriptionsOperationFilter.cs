using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace CollaborationSystem.Api.Documentation;

/// <summary>
/// Adds consistent descriptions for route/query parameters and request bodies that are shared across endpoints.
/// </summary>
public sealed class SwaggerParameterDescriptionsOperationFilter : IOperationFilter
{
    private static readonly IReadOnlyDictionary<string, string> ParameterDescriptions =
        new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            ["projectId"] = "Project identifier from the route.",
            ["suggestionId"] = "Suggestion identifier from the route.",
            ["commentId"] = "Comment identifier from the route.",
            ["draftId"] = "Draft identifier from the route.",
            ["userId"] = "User identifier from the route.",
            ["search"] = "Optional case-insensitive search text.",
            ["status"] = "Optional status filter.",
            ["type"] = "Optional draft type filter.",
            ["sort"] = "Optional sort field. Supported values depend on the endpoint.",
            ["order"] = "Optional sort direction: asc or desc.",
            ["page"] = "One-based page number.",
            ["pageSize"] = "Number of items per page."
        };

    private static readonly IReadOnlyDictionary<string, string> RequestBodyDescriptions =
        new Dictionary<string, string>(StringComparer.Ordinal)
        {
            [nameof(CollaborationSystem.Application.DTOs.Auth.LoginRequest)] = "Development user credentials.",
            [nameof(CollaborationSystem.Application.DTOs.Projects.CreateProjectRequest)] = "Project creation payload.",
            [nameof(CollaborationSystem.Application.DTOs.Projects.UpdateProjectRequest)] = "Project fields to update.",
            [nameof(CollaborationSystem.Application.DTOs.Projects.UpdateProjectSettingsRequest)] = "Project voting settings to update.",
            [nameof(CollaborationSystem.Application.DTOs.Projects.AddProjectMemberRequest)] = "User and role to add to the project.",
            [nameof(CollaborationSystem.Application.DTOs.Projects.UpdateProjectMemberRoleRequest)] = "New role for the existing project member.",
            [nameof(CollaborationSystem.Application.DTOs.Suggestions.CreateSuggestionRequest)] = "Suggestion text to create in the project.",
            [nameof(CollaborationSystem.Application.DTOs.Suggestions.UpdateSuggestionRequest)] = "Suggestion text replacement.",
            [nameof(CollaborationSystem.Application.DTOs.Suggestions.UpdateSuggestionStatusRequest)] = "New suggestion workflow status.",
            [nameof(CollaborationSystem.Application.DTOs.Suggestions.VoteRequest)] = "Vote value for the current user.",
            [nameof(CollaborationSystem.Application.DTOs.Suggestions.CreateCommentRequest)] = "Comment text and optional parent comment.",
            [nameof(CollaborationSystem.Application.DTOs.Suggestions.UpdateCommentRequest)] = "Comment text replacement.",
            [nameof(CollaborationSystem.Application.DTOs.Drafts.UpsertSuggestionDraftRequest)] = "Suggestion draft payload.",
            [nameof(CollaborationSystem.Application.DTOs.Drafts.UpsertCommentDraftRequest)] = "Comment draft payload."
        };

    public void Apply(OpenApiOperation operation, OperationFilterContext context)
    {
        foreach (var parameter in operation.Parameters)
        {
            if (string.IsNullOrWhiteSpace(parameter.Description) &&
                ParameterDescriptions.TryGetValue(parameter.Name, out var description))
            {
                parameter.Description = description;
            }
        }

        if (operation.RequestBody is null || !string.IsNullOrWhiteSpace(operation.RequestBody.Description))
        {
            return;
        }

        var bodyParameter = context.ApiDescription.ParameterDescriptions
            .FirstOrDefault(parameter => parameter.Source == BindingSource.Body);

        if (bodyParameter?.Type is not null &&
            RequestBodyDescriptions.TryGetValue(bodyParameter.Type.Name, out var bodyDescription))
        {
            operation.RequestBody.Description = bodyDescription;
        }
    }
}
