using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CollaborationSystem.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddProjectAndSuggestionUniqueness : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "NormalizedName",
                schema: "public",
                table: "Projects",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "NormalizedText",
                schema: "public",
                table: "Suggestions",
                type: "character varying(4000)",
                maxLength: 4000,
                nullable: false,
                defaultValue: "");

            migrationBuilder.Sql(
                """
                UPDATE "public"."Projects"
                SET "NormalizedName" = lower(btrim("Name"));
                """);

            migrationBuilder.Sql(
                """
                UPDATE "public"."Suggestions"
                SET "NormalizedText" = lower(btrim("Text"));
                """);

            migrationBuilder.Sql(
                """
                CREATE UNIQUE INDEX IF NOT EXISTS "UX_Projects_NormalizedName_Active"
                ON "public"."Projects" ("NormalizedName")
                WHERE "DeletedAtUtc" IS NULL;
                """);

            migrationBuilder.Sql(
                """
                CREATE UNIQUE INDEX IF NOT EXISTS "UX_Suggestions_ProjectId_NormalizedText"
                ON "public"."Suggestions" ("ProjectId", "NormalizedText");
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                DROP INDEX IF EXISTS "public"."UX_Suggestions_ProjectId_NormalizedText";
                """);

            migrationBuilder.Sql(
                """
                DROP INDEX IF EXISTS "public"."UX_Projects_NormalizedName_Active";
                """);

            migrationBuilder.DropColumn(
                name: "NormalizedText",
                schema: "public",
                table: "Suggestions");

            migrationBuilder.DropColumn(
                name: "NormalizedName",
                schema: "public",
                table: "Projects");
        }
    }
}
