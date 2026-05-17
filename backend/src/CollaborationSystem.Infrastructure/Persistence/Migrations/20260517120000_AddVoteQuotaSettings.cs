using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CollaborationSystem.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddVoteQuotaSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "VoteResetPeriodDays",
                schema: "public",
                table: "Projects",
                type: "integer",
                nullable: false,
                defaultValue: 14);

            migrationBuilder.AddColumn<int>(
                name: "VotesPerUser",
                schema: "public",
                table: "Projects",
                type: "integer",
                nullable: false,
                defaultValue: 3);

            migrationBuilder.AddColumn<DateTime>(
                name: "NextVoteResetAtUtc",
                schema: "public",
                table: "ProjectMembers",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "NOW() + INTERVAL '14 days'");

            migrationBuilder.AddColumn<DateTime>(
                name: "VotePeriodStartedAtUtc",
                schema: "public",
                table: "ProjectMembers",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "NOW()");

            migrationBuilder.AddColumn<int>(
                name: "VotesRemaining",
                schema: "public",
                table: "ProjectMembers",
                type: "integer",
                nullable: false,
                defaultValue: 3);

            migrationBuilder.AddColumn<DateTime>(
                name: "BudgetPeriodStartedAtUtc",
                schema: "public",
                table: "Votes",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "NOW()");

            migrationBuilder.Sql(
                """
                UPDATE public."Votes"
                SET "BudgetPeriodStartedAtUtc" = "CreatedAtUtc";
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "VoteResetPeriodDays",
                schema: "public",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "VotesPerUser",
                schema: "public",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "NextVoteResetAtUtc",
                schema: "public",
                table: "ProjectMembers");

            migrationBuilder.DropColumn(
                name: "VotePeriodStartedAtUtc",
                schema: "public",
                table: "ProjectMembers");

            migrationBuilder.DropColumn(
                name: "VotesRemaining",
                schema: "public",
                table: "ProjectMembers");

            migrationBuilder.DropColumn(
                name: "BudgetPeriodStartedAtUtc",
                schema: "public",
                table: "Votes");
        }
    }
}
