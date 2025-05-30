namespace OnlineTestSystem.DAL.Models
{
    public enum QuestionType
    {
        MultipleChoice,
        SingleChoice,
        TrueFalse,
        FillInTheBlanks,
        ShortAnswer,
        LongAnswer,
        Listening,
        Speaking
    }

    public enum QuestionLevel
    {
        Easy,
        Medium,
        Hard,
    }

    public class Question
    {
        public Guid Id { get; set; }
        public string Content { get; set; }
        public QuestionType QuestionType { get; set; }
        public string? AudioUrl { get; set; }
        public bool IsActive { get; set; } = true;
        public int Order { get; set; }
        public DateTime CreatedAt { get; set; }= DateTime.Now;
        public QuestionLevel Level { get; set; }
        public Guid? BankId { get; set; }
        public QuestionBank Bank { get; set; }
        public ICollection<Answer> Answers { get; set; }
        public ICollection<QuizQuestion> QuizQuestions { get; set; }
        public ICollection<UserAnswer> UserAnswers { get; set; }
    }
}
