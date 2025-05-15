using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OnlineTestSystem.DAL.Models;

namespace OnlineTestSystem.DAL.Configurations
{
    public class UserConfiguration : IEntityTypeConfiguration<User>
    {
        public void Configure(EntityTypeBuilder<User> builder)
        {
            builder.Property(u => u.StudentCode)
                .IsRequired(false)
                .HasMaxLength(10);

            builder.HasIndex(u => u.StudentCode)
                .IsUnique();

            builder.Property(u => u.FirstName)
                .IsRequired()
                .HasColumnType("Nvarchar(50)");

            builder.Property(u => u.LastName)
                .IsRequired()
                .HasColumnType("Nvarchar(50)");

            builder.Property(u => u.DateOfBirth)
                .IsRequired(false);

            builder.Property(u => u.Address)
                .IsRequired(false)
                .HasColumnType("Nvarchar(max)");

            builder.Property(u => u.IsActive)
                .HasDefaultValue(true);

            builder.Property(u => u.CreatedAt)
                .HasDefaultValueSql("GETDATE()");

            builder.Property(u => u.RoleId)
                .IsRequired();

            builder.HasOne(u => u.Role)
                .WithMany(r => r.Users)
                .HasForeignKey(u => u.RoleId);
        }
    }
}
