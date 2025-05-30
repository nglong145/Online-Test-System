namespace OnlineTestSystem.DAL.Models
{
    public class Answer
    {
        public Guid Id { get; set; }
        public string Content { get; set; }
        public bool IsCorrect { get; set; }
        public bool IsActive { get; set; } = true;
        public int Order { get; set; }
        public Guid QuestionId { get; set; }
        public Question Question { get; set; }

        public ICollection<UserAnswer> UserAnswers { get; set; }
    }
}
