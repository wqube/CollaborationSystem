using CollaborationSystem.Infrastructure.Persistence;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Npgsql;
using Testcontainers.PostgreSql;

namespace CollaborationSystem.Tests.Integration;

public sealed class IntegrationTestWebApplicationFactory : WebApplicationFactory<Program>, IAsyncLifetime
{
    private readonly PostgreSqlContainer postgres = new PostgreSqlBuilder()
        .WithImage("postgres:16-alpine")
        .WithDatabase("collaboration_system_tests")
        .WithUsername("postgres")
        .WithPassword("postgres")
        .Build();

    public async Task InitializeAsync()
    {
        await postgres.StartAsync();
        await WaitForDatabaseAsync();
        _ = Services;
    }

    async Task IAsyncLifetime.DisposeAsync()
    {
        await postgres.DisposeAsync();
    }

    public async Task ResetDatabaseAsync()
    {
        using var scope = Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        await dbContext.Database.ExecuteSqlRawAsync("""
            TRUNCATE TABLE
                "public"."Votes",
                "public"."Comments",
                "public"."Drafts",
                "public"."Suggestions",
                "public"."ProjectMeetings",
                "public"."ProjectMembers",
                "public"."Projects",
                "public"."AuthSessions"
            RESTART IDENTITY CASCADE;
            """);
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.ConfigureAppConfiguration((_, configBuilder) =>
        {
            configBuilder.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["ConnectionStrings:DefaultConnection"] = postgres.GetConnectionString(),
                ["Auth:RefreshTokenCookieName"] = "refreshToken",
                ["Auth:RefreshTokenCookiePath"] = "/api/v1/auth",
                ["Auth:RefreshTokenCookieSecure"] = "false",
                ["Auth:RefreshTokenLifetimeDays"] = "7"
            });
        });
        builder.ConfigureServices(services =>
        {
            services.RemoveAll<DbContextOptions<AppDbContext>>();
            services.RemoveAll<AppDbContext>();
            services.AddDbContext<AppDbContext>(options => options.UseNpgsql(postgres.GetConnectionString()));
        });
    }

    private async Task WaitForDatabaseAsync()
    {
        Exception? lastError = null;
        var attempts = 0;

        while (attempts < 30)
        {
            try
            {
                await using var connection = new NpgsqlConnection(postgres.GetConnectionString());
                await connection.OpenAsync();
                return;
            }
            catch (Exception ex)
            {
                lastError = ex;
                attempts++;
                await Task.Delay(TimeSpan.FromMilliseconds(500));
            }
        }

        throw new InvalidOperationException(
            "PostgreSQL test container did not become ready in time.",
            lastError);
    }
}
