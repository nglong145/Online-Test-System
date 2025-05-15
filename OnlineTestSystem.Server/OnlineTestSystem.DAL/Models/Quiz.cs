namespace OnlineTestSystem.DAL.Models
{
    public class Quiz
    {
        public Guid Id { get; set; }
        public Guid? Category { get; set; }
        public QuizCategory QuizCategory { get; set; }
        public string Title { get; set; }
        public string? Description { get; set; }
        public int Duration { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public ICollection<QuizQuestion> QuizQuestions { get; set; }
        public  ICollection<ExamQuiz> ExamQuizzes { get; set; }
        public  ICollection<UserQuiz> UserQuizzes { get; set; }
    }
}
