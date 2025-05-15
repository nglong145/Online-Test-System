using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;
using OnlineTestSystem.DAL.Models;

namespace OnlineTestSystem.DAL.Configurations
{
    public class RefreshTokenConfiguration : IEntityTypeConfiguration<RefreshToken>
    {
        public void Configure(EntityTypeBuilder<RefreshToken> builder)
        {
            builder.HasKey(r => r.Id);

            builder.Property(r => r.Token)
                   .IsRequired()
                   .HasMaxLength(500);

            builder.Property(r => r.JwtId)
                   .IsRequired();

            builder.Property(r => r.DateAdded)
                   .HasDefaultValueSql("GETDATE()");

            builder.HasIndex(r => r.Token).IsUnique();

            builder.HasCheckConstraint("CK_RefreshToken_ExpireAfterAdded", "[DateExpire] > [DateAdded]");

            builder.HasOne(r => r.User)
                   .WithMany(u => u.RefreshTokens)
                   .HasForeignKey(r => r.UserId)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
