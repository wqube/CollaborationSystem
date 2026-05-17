using System.Reflection;
using CollaborationSystem.Api.Documentation;
using Microsoft.OpenApi.Models;

namespace CollaborationSystem.Api.Extensions;

public static class SwaggerExtensions
{
    public static IServiceCollection AddSwaggerDocumentation(this IServiceCollection services)
    {
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen(options =>
        {
            options.SwaggerDoc("v1", new OpenApiInfo
            {
                Title = "Collaboration System API",
                Version = "v1"
            });

            var xmlFileName = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
            var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFileName);
            if (File.Exists(xmlPath))
            {
                options.IncludeXmlComments(xmlPath, includeControllerXmlComments: true);
            }

            var applicationXmlFileName = "CollaborationSystem.Application.xml";
            var applicationXmlPath = Path.Combine(AppContext.BaseDirectory, applicationXmlFileName);
            if (File.Exists(applicationXmlPath))
            {
                options.IncludeXmlComments(applicationXmlPath);
            }

            options.OperationFilter<SwaggerParameterDescriptionsOperationFilter>();
            options.OperationFilter<SwaggerResponseExamplesOperationFilter>();

            var securityScheme = new OpenApiSecurityScheme
            {
                Name = "Authorization",
                Type = SecuritySchemeType.Http,
                Scheme = "bearer",
                BearerFormat = "JWT",
                In = ParameterLocation.Header,
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            };

            options.AddSecurityDefinition("Bearer", securityScheme);
            options.AddSecurityRequirement(new OpenApiSecurityRequirement
            {
                {
                    securityScheme,
                    Array.Empty<string>()
                }
            });
        });

        return services;
    }
}
