using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OnlineTestSystem.DAL.Models;

namespace OnlineTestSystem.DAL.Configurations
{
    public class QuizCategoryConfiguration : IEntityTypeConfiguration<QuizCategory>
    {
        public void Configure(EntityTypeBuilder<QuizCategory> builder)
        {
            builder.HasKey(q => q.Id);

            builder.Property(q => q.Name)
                   .HasColumnType("nvarchar(255)")
                   .IsRequired();


            builder.Property(q => q.Description)
                   .IsRequired(false);

            builder.Property(q => q.IsActive)
                   .HasDefaultValue(true);

            builder.Property(q => q.ParentId)
                   .IsRequired(false);

            builder.HasOne(q => q.Parent)
                   .WithMany(q => q.Children)
                   .HasForeignKey(q => q.ParentId)
                   .OnDelete(DeleteBehavior.Restrict)
                   .IsRequired(false); 
        }
    }
}
