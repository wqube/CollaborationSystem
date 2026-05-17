using System.Collections;
using System.Reflection;
using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.OpenApi.Any;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace CollaborationSystem.Api.Documentation;

/// <summary>
/// Adds example payloads for documented HTTP response codes.
/// </summary>
public sealed class SwaggerResponseExamplesOperationFilter : IOperationFilter
{
    private static readonly DateTime ExampleDate = new(2026, 5, 17, 9, 30, 0, DateTimeKind.Utc);

    private static readonly IReadOnlyDictionary<int, string> ResponseDescriptions = new Dictionary<int, string>
    {
        [StatusCodes.Status200OK] = "Request completed successfully.",
        [StatusCodes.Status201Created] = "Resource was created successfully.",
        [StatusCodes.Status204NoContent] = "Request completed successfully. The response body is empty.",
        [StatusCodes.Status400BadRequest] = "Request validation failed or the operation is invalid.",
        [StatusCodes.Status401Unauthorized] = "Authentication is missing, expired, or invalid.",
        [StatusCodes.Status403Forbidden] = "The current user is authenticated but does not have access to this resource.",
        [StatusCodes.Status404NotFound] = "The requested resource was not found.",
        [StatusCodes.Status409Conflict] = "The request conflicts with the current resource state."
    };

    public void Apply(OpenApiOperation operation, OperationFilterContext context)
    {
        foreach (var (statusCodeText, response) in operation.Responses)
        {
            if (!int.TryParse(statusCodeText, out var statusCode))
            {
                continue;
            }

            if (ResponseDescriptions.TryGetValue(statusCode, out var description))
            {
                response.Description = description;
            }

            if (statusCode == StatusCodes.Status204NoContent)
            {
                response.Extensions["x-example"] = new OpenApiString("No response body.");
                continue;
            }

            var responseType = context.ApiDescription.SupportedResponseTypes
                .FirstOrDefault(apiResponse => apiResponse.StatusCode == statusCode)
                ?.Type;

            var example = statusCode == StatusCodes.Status400BadRequest
                ? CreateValidationProblemExample()
                : statusCode >= StatusCodes.Status400BadRequest
                    ? CreateProblemExample(statusCode)
                    : CreateSuccessExample(responseType, propertyName: null);

            foreach (var mediaType in response.Content.Values)
            {
                mediaType.Example ??= example;
            }
        }
    }

    private static IOpenApiAny CreateSuccessExample(Type? type, string? propertyName, int depth = 0)
    {
        if (type is null || type == typeof(void) || depth > 5)
        {
            return new OpenApiObject();
        }

        var underlyingType = Nullable.GetUnderlyingType(type);
        if (underlyingType is not null)
        {
            return CreateSuccessExample(underlyingType, propertyName, depth);
        }

        if (type == typeof(string))
        {
            return new OpenApiString(GetStringExample(propertyName));
        }

        if (type == typeof(Guid))
        {
            return new OpenApiString(GetGuidExample(propertyName).ToString());
        }

        if (type == typeof(DateTime) || type == typeof(DateTimeOffset))
        {
            return new OpenApiString(ExampleDate.ToString("O"));
        }

        if (type == typeof(int))
        {
            return new OpenApiInteger(GetIntegerExample(propertyName));
        }

        if (type == typeof(long))
        {
            return new OpenApiLong(GetIntegerExample(propertyName));
        }

        if (type == typeof(bool))
        {
            return new OpenApiBoolean(true);
        }

        if (type == typeof(float) || type == typeof(double) || type == typeof(decimal))
        {
            return new OpenApiDouble(42.5);
        }

        if (type == typeof(JsonElement))
        {
            return new OpenApiObject
            {
                ["text"] = new OpenApiString("Draft text"),
                ["suggestionId"] = new OpenApiString(GetGuidExample("suggestionId").ToString())
            };
        }

        if (type.IsEnum)
        {
            return new OpenApiString(GetEnumExample(type, propertyName));
        }

        var enumerableItemType = GetEnumerableItemType(type);
        if (enumerableItemType is not null && type != typeof(string))
        {
            return new OpenApiArray
            {
                CreateSuccessExample(enumerableItemType, propertyName, depth + 1)
            };
        }

        return CreateObjectExample(type, depth);
    }

    private static OpenApiObject CreateObjectExample(Type type, int depth)
    {
        var result = new OpenApiObject();

        foreach (var property in type.GetProperties(BindingFlags.Instance | BindingFlags.Public)
                     .Where(property => property.GetIndexParameters().Length == 0))
        {
            result[ToCamelCase(property.Name)] = CreateSuccessExample(
                property.PropertyType,
                property.Name,
                depth + 1);
        }

        return result;
    }

    private static IOpenApiAny CreateValidationProblemExample() =>
        new OpenApiObject
        {
            ["type"] = new OpenApiString("https://tools.ietf.org/html/rfc9110#section-15.5.1"),
            ["title"] = new OpenApiString("One or more validation errors occurred."),
            ["status"] = new OpenApiInteger(StatusCodes.Status400BadRequest),
            ["errors"] = new OpenApiObject
            {
                ["name"] = new OpenApiArray
                {
                    new OpenApiString("'Name' must not be empty.")
                }
            },
            ["traceId"] = new OpenApiString("00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-00")
        };

    private static IOpenApiAny CreateProblemExample(int statusCode) =>
        new OpenApiObject
        {
            ["type"] = new OpenApiString(GetProblemType(statusCode)),
            ["title"] = new OpenApiString(GetProblemTitle(statusCode)),
            ["status"] = new OpenApiInteger(statusCode),
            ["detail"] = new OpenApiString(GetProblemDetail(statusCode)),
            ["traceId"] = new OpenApiString("00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-00")
        };

    private static Type? GetEnumerableItemType(Type type)
    {
        if (type == typeof(string) || !typeof(IEnumerable).IsAssignableFrom(type))
        {
            return null;
        }

        if (type.IsArray)
        {
            return type.GetElementType();
        }

        if (type.IsGenericType)
        {
            return type.GetGenericArguments().FirstOrDefault();
        }

        return type.GetInterfaces()
            .Where(interfaceType => interfaceType.IsGenericType)
            .FirstOrDefault(interfaceType => interfaceType.GetGenericTypeDefinition() == typeof(IEnumerable<>))
            ?.GetGenericArguments()
            .FirstOrDefault();
    }

    private static string GetStringExample(string? propertyName) =>
        propertyName switch
        {
            "AccessToken" => "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example",
            "AuthMode" => "DevLogin",
            "Description" => "Collect and prioritize product ideas.",
            "Detail" => "The request could not be completed.",
            "DisplayName" => "Alex Johnson",
            "Email" => "alex@example.com",
            "Name" => "Product feedback board",
            "Order" => "desc",
            "Search" => "feedback",
            "Sort" => "createdAt",
            "Status" => "ok",
            "Text" => "Add export to CSV for project suggestions.",
            _ => "Example value"
        };

    private static int GetIntegerExample(string? propertyName) =>
        propertyName switch
        {
            "ExpiresIn" => 900,
            "Page" => 1,
            "PageSize" => 20,
            "Score" => 8,
            "Total" => 42,
            "VoteResetPeriodDays" => 7,
            "VotesLimit" => 10,
            "VotesPerUser" => 10,
            "VotesRemaining" => 6,
            _ => 1
        };

    private static Guid GetGuidExample(string? propertyName) =>
        propertyName switch
        {
            "ProjectId" or "projectId" => Guid.Parse("11111111-1111-1111-1111-111111111111"),
            "SuggestionId" or "suggestionId" => Guid.Parse("22222222-2222-2222-2222-222222222222"),
            "CommentId" or "commentId" or "ParentCommentId" => Guid.Parse("33333333-3333-3333-3333-333333333333"),
            "DraftId" or "draftId" => Guid.Parse("44444444-4444-4444-4444-444444444444"),
            "UserId" or "CreatedByUserId" or "Id" => Guid.Parse("55555555-5555-5555-5555-555555555555"),
            _ => Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa")
        };

    private static string GetEnumExample(Type type, string? propertyName)
    {
        var names = Enum.GetNames(type);

        if (propertyName == "Role" && names.Contains("Member"))
        {
            return "Member";
        }

        if (propertyName == "Status" && names.Contains("Open"))
        {
            return "Open";
        }

        if (propertyName == "VoteType" && names.Contains("Up"))
        {
            return "Up";
        }

        return names.FirstOrDefault() ?? "Unknown";
    }

    private static string GetProblemType(int statusCode) =>
        statusCode switch
        {
            StatusCodes.Status401Unauthorized => "https://tools.ietf.org/html/rfc9110#section-15.5.2",
            StatusCodes.Status403Forbidden => "https://tools.ietf.org/html/rfc9110#section-15.5.4",
            StatusCodes.Status404NotFound => "https://tools.ietf.org/html/rfc9110#section-15.5.5",
            StatusCodes.Status409Conflict => "https://tools.ietf.org/html/rfc9110#section-15.5.10",
            _ => "https://tools.ietf.org/html/rfc9110"
        };

    private static string GetProblemTitle(int statusCode) =>
        statusCode switch
        {
            StatusCodes.Status401Unauthorized => "Unauthorized",
            StatusCodes.Status403Forbidden => "Forbidden",
            StatusCodes.Status404NotFound => "Resource not found.",
            StatusCodes.Status409Conflict => "Resource conflict.",
            _ => "Request failed."
        };

    private static string GetProblemDetail(int statusCode) =>
        statusCode switch
        {
            StatusCodes.Status401Unauthorized => "Provide a valid bearer token or refresh token.",
            StatusCodes.Status403Forbidden => "The current user cannot perform this action.",
            StatusCodes.Status404NotFound => "The requested project, suggestion, comment, draft, or user was not found.",
            StatusCodes.Status409Conflict => "The request conflicts with uniqueness, role, or vote quota rules.",
            _ => "The request could not be completed."
        };

    private static string ToCamelCase(string value) =>
        string.IsNullOrEmpty(value)
            ? value
            : char.ToLowerInvariant(value[0]) + value[1..];
}
