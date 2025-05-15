using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;
using OnlineTestSystem.DAL.Models;

namespace OnlineTestSystem.DAL.Configurations
{
    public class ExamQuizConfiguration : IEntityTypeConfiguration<ExamQuiz>
    {
        public void Configure(EntityTypeBuilder<ExamQuiz> builder)
        {

            builder.HasKey(eq => new { eq.ExamId, eq.QuizId });

            builder.HasOne(eq => eq.Exam)
                   .WithMany(e => e.ExamQuizzes)
                   .HasForeignKey(eq => eq.ExamId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(eq => eq.Quiz)
                   .WithMany(q => q.ExamQuizzes)
                   .HasForeignKey(eq => eq.QuizId)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
