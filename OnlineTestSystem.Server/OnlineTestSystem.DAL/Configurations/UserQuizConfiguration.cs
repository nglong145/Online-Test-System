using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OnlineTestSystem.DAL.Models;

namespace OnlineTestSystem.DAL.Configurations
{
    public class UserQuizConfiguration : IEntityTypeConfiguration<UserQuiz>
    {
        public void Configure(EntityTypeBuilder<UserQuiz> builder)
        {
            builder.HasKey(uq => uq.Id);

            builder.HasOne(uq => uq.User)
                   .WithMany(u => u.UserQuizzes)
                   .HasForeignKey(uq => uq.UserId)
                   .OnDelete(DeleteBehavior.Restrict); 

            builder.HasOne(uq => uq.Quiz)
                   .WithMany(q => q.UserQuizzes)
                   .HasForeignKey(uq => uq.QuizId)
                   .OnDelete(DeleteBehavior.Restrict); 

            builder.HasOne(uq => uq.Exam)
                   .WithMany(e => e.UserQuizzes)
                   .HasForeignKey(uq => uq.ExamId)
                   .OnDelete(DeleteBehavior.SetNull); 

            builder.HasIndex(uq => new { uq.UserId, uq.QuizId, uq.ExamId })
                   .IsUnique();

            builder.Property(q => q.StartedAt)
                   .HasDefaultValueSql("GETDATE()");

            builder.HasCheckConstraint("CK_UserQuiz_StartBeforeEnd", "[StartedAt] < [FinishedAt]");

            builder.Property(uq => uq.Score)
                   .IsRequired(false);

            builder.HasCheckConstraint("CK_UserQuiz_Score", "[Score] >= 0");

            builder.Property(uq => uq.IsComplete)
                   .HasDefaultValue(false);
        }
    }
}
