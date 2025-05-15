using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using OnlineTestSystem.DAL.Configurations;
using OnlineTestSystem.DAL.Models;

namespace OnlineTestSystem.DAL.Data
{
    public class TestSystemDbContext: IdentityDbContext<User, Role, Guid>
    {
        public DbSet<Answer> Answers { get; set; }
        public DbSet<Exam> Exams { get; set; }
        public DbSet<ExamGroup> ExamGroups { get; set; }
        public DbSet<ExamParticipant> ExamParticipants { get; set; }
        public DbSet<ExamQuiz> ExamQuizzes { get; set; }
        public DbSet<Group> Groups { get; set; }
        public DbSet<Question> Questions { get; set; }
        public DbSet<QuestionBank> QuestionBanks { get; set; }
        public DbSet<Quiz> Quizzes { get; set; }
        public DbSet<QuizCategory> QuizCategories { get; set; }
        public DbSet<QuizQuestion> QuizQuestions { get; set; }
        public DbSet<RefreshToken> RefreshTokens { get; set; }
        public DbSet<UserAnswer> UserAnswers { get; set; }
        public DbSet<UserGroup> UserGroups { get; set; }
        public DbSet<UserQuiz> UserQuizzes { get; set; }


        public TestSystemDbContext(DbContextOptions<TestSystemDbContext> options) : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            
            modelBuilder.Ignore<IdentityUserRole<Guid>>();
            modelBuilder.Ignore<IdentityUserClaim<Guid>>();
            modelBuilder.Ignore<IdentityRoleClaim<Guid>>();
            modelBuilder.Ignore<IdentityUserToken<Guid>>();



            modelBuilder.ApplyConfiguration(new AnswerConfiguration());
            modelBuilder.ApplyConfiguration(new ExamConfiguration());
            modelBuilder.ApplyConfiguration(new ExamGroupConfiguration());
            modelBuilder.ApplyConfiguration(new ExamParticipantConfiguration());
            modelBuilder.ApplyConfiguration(new ExamQuizConfiguration());
            modelBuilder.ApplyConfiguration(new GroupConfiguration());
            modelBuilder.ApplyConfiguration(new QuestionBankConfiguration());
            modelBuilder.ApplyConfiguration(new QuestionConfiguration());
            modelBuilder.ApplyConfiguration(new QuizCategoryConfiguration());
            modelBuilder.ApplyConfiguration(new QuizConfiguration());
            modelBuilder.ApplyConfiguration(new QuizQuestionConfiguration());
            modelBuilder.ApplyConfiguration(new RefreshTokenConfiguration());
            modelBuilder.ApplyConfiguration(new UserAnswerConfiguration());
            modelBuilder.ApplyConfiguration(new UserConfiguration());
            modelBuilder.ApplyConfiguration(new UserGroupConfiguration());
            modelBuilder.ApplyConfiguration(new UserQuizConfiguration());

            //modelBuilder.Seed();
        }
    }
}
