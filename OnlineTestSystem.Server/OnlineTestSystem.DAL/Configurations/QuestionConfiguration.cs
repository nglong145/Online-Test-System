using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OnlineTestSystem.DAL.Models;

namespace OnlineTestSystem.DAL.Configurations
{
    public class QuestionConfiguration : IEntityTypeConfiguration<Question>
    {
        public void Configure(EntityTypeBuilder<Question> builder)
        {
            builder.HasKey(q => q.Id);

            builder.Property(q => q.Content)
                   .IsRequired();

            builder.Property(q => q.QuestionType)
                   .HasConversion<string>() 
                   .IsRequired();

            builder.HasCheckConstraint("CK_Question_Type", "[QuestionType] IN ('MultipleChoice', 'SingleChoice', 'TrueFalse','FillInTheBlanks','ShortAnswer','LongAnswer','Listening','Speaking')");

            builder.Property(q => q.AudioUrl)
                   .IsRequired(false);

            builder.Property(q => q.IsActive)
                   .HasDefaultValue(true);

            builder.Property(q => q.CreatedAt)
                   .HasDefaultValueSql("GETDATE()");

            builder.Property(q => q.Level)
                   .HasConversion<string>() 
                   .IsRequired();

            builder.HasCheckConstraint("CK_Question_Level", "[Level] IN ('Easy', 'Medium', 'Hard')");

            builder.HasOne(q => q.Bank)
                   .WithMany(b => b.Questions)
                   .HasForeignKey(q => q.BankId)
                   .OnDelete(DeleteBehavior.SetNull)
                   .IsRequired(false); 
        }
    }
}
