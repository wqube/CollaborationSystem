using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CollaborationSystem.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddProjectMeetingsAndNormalizedFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                ALTER TABLE "public"."Projects"
                ADD COLUMN IF NOT EXISTS "NormalizedName" character varying(200);

                UPDATE "public"."Projects"
                SET "NormalizedName" = UPPER(regexp_replace(btrim("Name"), '\s+', ' ', 'g'))
                WHERE "NormalizedName" IS NULL OR "NormalizedName" = '';

                ALTER TABLE "public"."Projects"
                ALTER COLUMN "NormalizedName" SET NOT NULL;

                CREATE INDEX IF NOT EXISTS "IX_Projects_NormalizedName"
                ON "public"."Projects" ("NormalizedName")
                WHERE "DeletedAtUtc" IS NULL;
                """);

            migrationBuilder.Sql(
                """
                ALTER TABLE "public"."ProjectMembers"
                ADD COLUMN IF NOT EXISTS "LastAccessedAtUtc" timestamp with time zone;

                UPDATE "public"."ProjectMembers"
                SET "LastAccessedAtUtc" = "JoinedAtUtc"
                WHERE "LastAccessedAtUtc" IS NULL;

                ALTER TABLE "public"."ProjectMembers"
                ALTER COLUMN "LastAccessedAtUtc" SET NOT NULL;
                """);

            migrationBuilder.Sql(
                """
                ALTER TABLE "public"."Suggestions"
                ADD COLUMN IF NOT EXISTS "NormalizedText" character varying(2000);

                UPDATE "public"."Suggestions"
                SET "NormalizedText" = UPPER(regexp_replace(btrim("Text"), '\s+', ' ', 'g'))
                WHERE "NormalizedText" IS NULL OR "NormalizedText" = '';

                ALTER TABLE "public"."Suggestions"
                ALTER COLUMN "NormalizedText" SET NOT NULL;

                CREATE INDEX IF NOT EXISTS "IX_Suggestions_ProjectId_NormalizedText"
                ON "public"."Suggestions" ("ProjectId", "NormalizedText");
                """);

            migrationBuilder.CreateTable(
                name: "ProjectMeetings",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ProjectId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    StartsAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EndsAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Location = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                    Agenda = table.Column<string>(type: "text", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProjectMeetings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProjectMeetings_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalSchema: "public",
                        principalTable: "Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProjectMeetings_Users_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalSchema: "public",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ProjectMeetings_CreatedByUserId",
                schema: "public",
                table: "ProjectMeetings",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectMeetings_ProjectId",
                schema: "public",
                table: "ProjectMeetings",
                column: "ProjectId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ProjectMeetings",
                schema: "public");

            migrationBuilder.Sql(
                """
                DROP INDEX IF EXISTS "public"."IX_Suggestions_ProjectId_NormalizedText";
                ALTER TABLE "public"."Suggestions" DROP COLUMN IF EXISTS "NormalizedText";

                ALTER TABLE "public"."ProjectMembers" DROP COLUMN IF EXISTS "LastAccessedAtUtc";

                DROP INDEX IF EXISTS "public"."IX_Projects_NormalizedName";
                ALTER TABLE "public"."Projects" DROP COLUMN IF EXISTS "NormalizedName";
                """);
        }
    }
}
