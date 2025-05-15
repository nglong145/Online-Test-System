using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OnlineTestSystem.DAL.Models;

namespace OnlineTestSystem.DAL.Configurations
{
    public class AnswerConfiguration : IEntityTypeConfiguration<Answer>
    {
        public void Configure(EntityTypeBuilder<Answer> builder)
        {
            builder.HasKey(a => a.Id);

            builder.Property(a => a.Content)
                   .IsRequired()
                   .HasColumnType("nvarchar(max)");

            builder.Property(a => a.IsCorrect)
                   .HasDefaultValue(false);

            builder.Property(a => a.IsActive)
                   .HasDefaultValue(true);

            builder.HasOne(a => a.Question)
                   .WithMany(q => q.Answers)
                   .HasForeignKey(a => a.QuestionId)
                   .OnDelete(DeleteBehavior.Cascade)
                   .IsRequired();

        }
    }
}
