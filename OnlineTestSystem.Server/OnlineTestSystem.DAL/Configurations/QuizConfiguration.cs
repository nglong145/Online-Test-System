using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OnlineTestSystem.DAL.Models;

namespace OnlineTestSystem.DAL.Configurations
{
    public class QuizConfiguration : IEntityTypeConfiguration<Quiz>
    {
        public void Configure(EntityTypeBuilder<Quiz> builder)
        {
            builder.HasKey(q => q.Id);

            builder.Property(q => q.Title)
                   .HasColumnType("nvarchar(255)")
                   .IsRequired();

            builder.Property(q => q.Description)
                   .HasColumnType("nvarchar(500)")
                   .IsRequired(false);

            builder.Property(q => q.Duration)
                   .IsRequired();

            builder.HasCheckConstraint("CK_Quiz_Duration", "[Duration] >= 1 AND [Duration] <= 3600");

            builder.Property(q => q.IsActive)
                   .HasDefaultValue(true);

            builder.Property(q => q.CreatedAt)
                   .HasDefaultValueSql("GETDATE()");

            builder.HasOne(q => q.QuizCategory)
                   .WithMany(c => c.Quizzes)
                   .HasForeignKey(q => q.Category)
                   .OnDelete(DeleteBehavior.SetNull)
                   .IsRequired(false);
        }
    }

}
