using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;
using OnlineTestSystem.DAL.Models;

namespace OnlineTestSystem.DAL.Configurations
{
    public class UserGroupConfiguration : IEntityTypeConfiguration<UserGroup>
    {
        public void Configure(EntityTypeBuilder<UserGroup> builder)
        {
            builder.HasKey(ug => new { ug.UserId, ug.GroupId });

            builder.HasOne(ug => ug.User)
                   .WithMany(u => u.UserGroups)
                   .HasForeignKey(ug => ug.UserId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(ug => ug.Group)
                   .WithMany(g => g.UserGroups)
                   .HasForeignKey(ug => ug.GroupId)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
