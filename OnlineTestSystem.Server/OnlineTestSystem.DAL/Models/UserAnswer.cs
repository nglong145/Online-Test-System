namespace OnlineTestSystem.DAL.Models
{
    public class UserAnswer
    {
        public Guid Id { get; set; }
        public Guid UserQuizId { get; set; }
        public UserQuiz UserQuiz { get; set; }
        public Guid QuestionId { get; set; }
        public Question Question { get; set; }
        public Guid? AnswerId { get; set; }
        public Answer Answer { get; set; }
        public string? UserVoiceUrl { get; set; }
        public string? AnswerText { get; set; }
        public bool IsCorrect { get; set; } =false;
    }
}
