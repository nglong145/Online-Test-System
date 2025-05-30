using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OnlineTestSystem.DAL.Migrations
{
    /// <inheritdoc />
    public partial class AddCreatedAtTableCategory_Exam_Bank : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "QuizCategories",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "GETDATE()");

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "QuestionBanks",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "GETDATE()");

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "Exams",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "GETDATE()");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "QuizCategories");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "QuestionBanks");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "Exams");
        }
    }
}
