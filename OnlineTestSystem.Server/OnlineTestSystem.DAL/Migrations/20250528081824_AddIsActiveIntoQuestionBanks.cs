using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OnlineTestSystem.DAL.Migrations
{
    /// <inheritdoc />
    public partial class AddIsActiveIntoQuestionBanks : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "QuestionBanks",
                type: "bit",
                nullable: false,
                defaultValue: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "QuestionBanks");
        }
    }
}
