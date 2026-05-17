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
            migrationBuilder.Sql(
                """
                ALTER TABLE "public"."Projects"
                ADD COLUMN IF NOT EXISTS "DeletedAtUtc" timestamp with time zone NULL;
                """);

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

            migrationBuilder.Sql(
                """
                CREATE UNIQUE INDEX IF NOT EXISTS "IX_AuthSessions_UserId_Active"
                ON "public"."AuthSessions" ("UserId")
                WHERE "RevokedAtUtc" IS NULL;
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                DROP INDEX IF EXISTS "public"."IX_AuthSessions_UserId_Active";
                """);

            migrationBuilder.Sql(
                """
                ALTER TABLE "public"."Projects"
                DROP COLUMN IF EXISTS "DeletedAtUtc";
                """);
        }
    }
}
