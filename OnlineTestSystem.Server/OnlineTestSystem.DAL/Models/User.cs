using Microsoft.AspNetCore.Identity;

namespace OnlineTestSystem.DAL.Models
{
    public class User : IdentityUser<Guid>
    {
        public string? StudentCode { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string? Address { get; set; }
        public bool? IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public Guid RoleId { get; set; }
        public Role Role { get; set; }

        public ICollection<QuestionBank> QuestionBanks { get; set; }
        public ICollection<UserQuiz> UserQuizzes { get; set; }
        public ICollection<ExamParticipant> ExamParticipants { get; set; }
        public ICollection<UserGroup> UserGroups { get; set; }
        public ICollection<Group> ManagedGroups { get; set; }
        public ICollection<RefreshToken> RefreshTokens { get; set; }
    }
}
