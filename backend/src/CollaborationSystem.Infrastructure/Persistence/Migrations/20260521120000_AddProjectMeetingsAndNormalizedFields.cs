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
                ALTER TABLE "public"."ProjectMembers"
                ADD COLUMN IF NOT EXISTS "LastAccessedAtUtc" timestamp with time zone;

                UPDATE "public"."ProjectMembers"
                SET "LastAccessedAtUtc" = "JoinedAtUtc"
                WHERE "LastAccessedAtUtc" IS NULL;

                ALTER TABLE "public"."ProjectMembers"
                ALTER COLUMN "LastAccessedAtUtc" SET NOT NULL;
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
                ALTER TABLE "public"."ProjectMembers" DROP COLUMN IF EXISTS "LastAccessedAtUtc";
                """);
        }
    }
}
