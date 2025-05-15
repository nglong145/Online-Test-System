using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OnlineTestSystem.DAL.Migrations
{
    /// <inheritdoc />
    public partial class AllowNullStudentCodeTableUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_AspNetUsers_StudentCode",
                table: "AspNetUsers");

            migrationBuilder.AlterColumn<string>(
                name: "StudentCode",
                table: "AspNetUsers",
                type: "nvarchar(10)",
                maxLength: 10,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(10)",
                oldMaxLength: 10);

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUsers_StudentCode",
                table: "AspNetUsers",
                column: "StudentCode",
                unique: true,
                filter: "[StudentCode] IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_AspNetUsers_StudentCode",
                table: "AspNetUsers");

            migrationBuilder.AlterColumn<string>(
                name: "StudentCode",
                table: "AspNetUsers",
                type: "nvarchar(10)",
                maxLength: 10,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(10)",
                oldMaxLength: 10,
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUsers_StudentCode",
                table: "AspNetUsers",
                column: "StudentCode",
                unique: true);
        }
    }
}
