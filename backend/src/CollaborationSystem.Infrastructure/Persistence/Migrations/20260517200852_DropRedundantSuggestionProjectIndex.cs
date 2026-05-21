using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CollaborationSystem.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class DropRedundantSuggestionProjectIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                DROP INDEX IF EXISTS "public"."IX_Suggestions_ProjectId";
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                CREATE INDEX IF NOT EXISTS "IX_Suggestions_ProjectId"
                ON "public"."Suggestions" ("ProjectId");
                """);
        }
    }
}
