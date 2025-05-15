namespace OnlineTestSystem.DAL.Models
{
    public class ExamQuiz
    {
        public Guid ExamId { get; set; }
        public Exam Exam { get; set; }
        public Guid QuizId { get; set; }
        public Quiz Quiz { get; set; }
        public int Order { get; set; }
    }
}
