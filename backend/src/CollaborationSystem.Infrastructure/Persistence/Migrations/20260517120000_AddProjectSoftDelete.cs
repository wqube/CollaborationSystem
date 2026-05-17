using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CollaborationSystem.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddProjectSoftDelete : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAtUtc",
                schema: "public",
                table: "Projects",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.Sql(
                """
                UPDATE "public"."AuthSessions" AS current_session
                SET "RevokedAtUtc" = NOW(),
                    "UpdatedAtUtc" = NOW()
                WHERE current_session."RevokedAtUtc" IS NULL
                  AND EXISTS (
                      SELECT 1
                      FROM "public"."AuthSessions" AS newer_session
                      WHERE newer_session."UserId" = current_session."UserId"
                        AND newer_session."RevokedAtUtc" IS NULL
                        AND (
                            newer_session."CreatedAtUtc" > current_session."CreatedAtUtc"
                            OR (
                                newer_session."CreatedAtUtc" = current_session."CreatedAtUtc"
                                AND newer_session."Id" > current_session."Id"
                            )
                        )
                  );
                """);

            migrationBuilder.CreateIndex(
                name: "IX_AuthSessions_UserId_Active",
                schema: "public",
                table: "AuthSessions",
                column: "UserId",
                unique: true,
                filter: "\"RevokedAtUtc\" IS NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_AuthSessions_UserId_Active",
                schema: "public",
                table: "AuthSessions");

            migrationBuilder.DropColumn(
                name: "DeletedAtUtc",
                schema: "public",
                table: "Projects");
        }
    }
}
