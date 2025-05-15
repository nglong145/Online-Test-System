using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OnlineTestSystem.DAL.Models;

namespace OnlineTestSystem.DAL.Configurations
{
    public class QuestionBankConfiguration : IEntityTypeConfiguration<QuestionBank>
    {
        public void Configure(EntityTypeBuilder<QuestionBank> builder)
        {
            builder.HasKey(qb => qb.Id);

            builder.Property(qb => qb.Name)
                   .HasMaxLength(255)
                   .IsUnicode(true);

            builder.HasOne(qb => qb.Owner)
                   .WithMany(u => u.QuestionBanks)
                   .HasForeignKey(qb => qb.OwnerId)
                   .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(qb => qb.QuizCategory)
                   .WithMany(qc=>qc.QuestionBanks)
                   .HasForeignKey(qb => qb.QuizCategoryId)
                   .OnDelete(DeleteBehavior.SetNull)
                   .IsRequired(false);
        }
    }
}
