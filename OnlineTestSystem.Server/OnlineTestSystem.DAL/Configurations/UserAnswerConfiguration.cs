using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OnlineTestSystem.DAL.Models;

namespace OnlineTestSystem.DAL.Configurations
{
    public class UserAnswerConfiguration : IEntityTypeConfiguration<UserAnswer>
    {
        public void Configure(EntityTypeBuilder<UserAnswer> builder)
        {
            builder.HasKey(ua => ua.Id);

            builder.HasOne(ua => ua.UserQuiz)
                   .WithMany(uq => uq.UserAnswers)
                   .HasForeignKey(ua => ua.UserQuizId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(ua => ua.Question)
                   .WithMany(q => q.UserAnswers)
                   .HasForeignKey(ua => ua.QuestionId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(ua => ua.Answer)
                   .WithMany(a => a.UserAnswers)
                   .HasForeignKey(ua => ua.AnswerId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.Property(ua => ua.UserVoiceUrl)
                   .IsRequired(false);

            builder.Property(ua => ua.AnswerText)
                   .IsRequired(false);

            builder.Property(ua => ua.IsCorrect)
                   .HasDefaultValue(false);

        }
    }
}