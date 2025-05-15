using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OnlineTestSystem.DAL.Models;

namespace OnlineTestSystem.DAL.Configurations
{
    public class QuizQuestionConfiguration : IEntityTypeConfiguration<QuizQuestion>
    {
        public void Configure(EntityTypeBuilder<QuizQuestion> builder)
        {
            builder.HasKey(q => new { q.QuizId, q.QuestionId });

            builder.HasOne(q => q.Quiz)
                   .WithMany(q => q.QuizQuestions) 
                   .HasForeignKey(q => q.QuizId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(q => q.Question)
                   .WithMany(q => q.QuizQuestions) 
                   .HasForeignKey(q => q.QuestionId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasCheckConstraint("CK_QuizQuestion_Score", "[Score] >= 0");
        }
    }
}
