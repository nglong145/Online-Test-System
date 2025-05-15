namespace OnlineTestSystem.DAL.Models
{
    public class QuizQuestion
    {
        public Guid QuizId { get; set; }
        public Quiz Quiz { get; set; }
        public Guid QuestionId { get; set; }
        public Question Question { get; set; }
        public int Order { get; set; }
        public float Score { get; set; }
    }
}
