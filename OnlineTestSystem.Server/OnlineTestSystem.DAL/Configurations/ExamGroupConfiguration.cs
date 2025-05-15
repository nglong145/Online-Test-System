using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;
using OnlineTestSystem.DAL.Models;

namespace OnlineTestSystem.DAL.Configurations
{
    public class ExamGroupConfiguration : IEntityTypeConfiguration<ExamGroup>
    {
        public void Configure(EntityTypeBuilder<ExamGroup> builder)
        {

            builder.HasKey(eg => new { eg.ExamId, eg.GroupId });

            builder.HasOne(eg => eg.Exam)
                   .WithMany(e => e.ExamGroups)
                   .HasForeignKey(eg => eg.ExamId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(eg => eg.Group)
                   .WithMany(g => g.ExamGroups)
                   .HasForeignKey(eg => eg.GroupId)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
