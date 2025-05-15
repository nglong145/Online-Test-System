using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OnlineTestSystem.DAL.Models;

namespace OnlineTestSystem.DAL.Configurations
{
    public class ExamParticipantConfiguration : IEntityTypeConfiguration<ExamParticipant>
    {
        public void Configure(EntityTypeBuilder<ExamParticipant> builder)
        {

            builder.HasKey(ep => new { ep.ExamId, ep.UserId });

            builder.HasOne(ep => ep.Exam)
                   .WithMany(e => e.Participants)
                   .HasForeignKey(ep => ep.ExamId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(ep => ep.User)
                   .WithMany(u => u.ExamParticipants)
                   .HasForeignKey(ep => ep.UserId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.Property(ep => ep.Status)
                   .HasMaxLength(50);

            builder.Property(ep => ep.Note)
                   .HasMaxLength(225)
                   .IsUnicode(true);
        }
    }
}
