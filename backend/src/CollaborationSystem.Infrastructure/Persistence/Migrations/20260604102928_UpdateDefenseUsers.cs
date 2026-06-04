using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace CollaborationSystem.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class UpdateDefenseUsers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                schema: "public",
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                columns: new[] { "DisplayName", "DomainLogin", "Email" },
                values: new object[] { "Михаил Баранов", "TBANK\\mikhail.baranov", "mikhail.baranov@test.local" });

            migrationBuilder.InsertData(
                schema: "public",
                table: "Users",
                columns: new[] { "Id", "CreatedAtUtc", "DisplayName", "DomainLogin", "Email", "PasswordHash", "UpdatedAtUtc" },
                values: new object[,]
                {
                    { new Guid("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Эльмир Нуруллин", "TBANK\\elmir.nurullin", "elmir.nurullin@test.local", "DEV_PASSWORD_HASH", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("cccccccc-cccc-cccc-cccc-cccccccccccc"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Никита Малышонков", "TBANK\\nikita.malyshonkov", "nikita.malyshonkov@test.local", "DEV_PASSWORD_HASH", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("dddddddd-dddd-dddd-dddd-dddddddddddd"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Заварзин Всеволод", "TBANK\\vsevolod.zavarzin", "vsevolod.zavarzin@test.local", "DEV_PASSWORD_HASH", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Тарасов Александр", "TBANK\\alexander.tarasov", "alexander.tarasov@test.local", "DEV_PASSWORD_HASH", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                schema: "public",
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"));

            migrationBuilder.DeleteData(
                schema: "public",
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("cccccccc-cccc-cccc-cccc-cccccccccccc"));

            migrationBuilder.DeleteData(
                schema: "public",
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("dddddddd-dddd-dddd-dddd-dddddddddddd"));

            migrationBuilder.DeleteData(
                schema: "public",
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee"));

            migrationBuilder.UpdateData(
                schema: "public",
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                columns: new[] { "DisplayName", "DomainLogin", "Email" },
                values: new object[] { "Михаил Баранчик", "TBANK\\mikhail.baranchik", "mikhail.baranchik@test.local" });
        }
    }
}
