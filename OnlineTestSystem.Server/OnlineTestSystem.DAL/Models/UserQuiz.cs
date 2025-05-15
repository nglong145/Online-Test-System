namespace OnlineTestSystem.DAL.Models
{
    public class UserQuiz
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public User User { get; set; }
        public Guid QuizId { get; set; }
        public Quiz Quiz { get; set; }
        public Guid? ExamId { get; set; }
        public Exam Exam { get; set; }
        public DateTime StartedAt { get; set; }=DateTime.Now;
        public DateTime FinishedAt { get; set; }
        public float? Score { get; set; }
        public bool IsComplete { get; set; } =false;
        public ICollection<UserAnswer> UserAnswers { get; set; }
    }
}
