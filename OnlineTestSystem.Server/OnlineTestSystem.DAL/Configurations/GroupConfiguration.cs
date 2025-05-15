using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OnlineTestSystem.DAL.Models;

namespace OnlineTestSystem.DAL.Configurations
{
    public class GroupConfiguration : IEntityTypeConfiguration<Group>
    {
        public void Configure(EntityTypeBuilder<Group> builder)
        {
            builder.HasKey(g => g.Id);

            builder.Property(g => g.Name)
                .IsRequired()
                .HasColumnType("nvarchar(255)");

            builder.Property(g => g.Description)
                .IsRequired(false);

            builder.Property(g => g.IsActive)
                .HasDefaultValue(true);

            builder.Property(g => g.CreatedAt)
                .HasDefaultValueSql("GETDATE()");

            builder.Property(g => g.UserManager)
                .IsRequired(false);

            builder.HasOne(g => g.Manager)
                .WithMany(u => u.ManagedGroups) 
                .HasForeignKey(g => g.UserManager)
                .OnDelete(DeleteBehavior.SetNull); 
        }
    }
}
