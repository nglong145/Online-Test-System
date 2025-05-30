using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OnlineTestSystem.DAL.Models;

namespace OnlineTestSystem.DAL.Configurations
{
    public class ExamConfiguration : IEntityTypeConfiguration<Exam>
    {
        public void Configure(EntityTypeBuilder<Exam> builder)
        {
            builder.HasKey(e => e.Id);

            builder.Property(e => e.Name)
                   .HasColumnType("nvarchar(255)")
                   .IsRequired(); 

            builder.Property(e => e.Description)
                   .IsRequired(false); 

            builder.Property(e => e.AccessCode)
                   .HasColumnType("varchar(20)")
                   .IsRequired(false); 

            builder.Property(e => e.StartTime)
                   .IsRequired();

            builder.Property(e => e.EndTime)
                   .IsRequired(false);

            builder.HasCheckConstraint("CK_Exam_StartBeforeEnd", "[StartTime] < [EndTime]");


            builder.Property(e => e.IsActive)
                   .HasDefaultValue(true);

            builder.Property(e => e.CreatedAt)
               .HasDefaultValueSql("GETDATE()");

        }
    }
}
