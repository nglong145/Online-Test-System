namespace OnlineTestSystem.DAL.Models
{
    public class QuizCategory
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string? Description { get; set; }
        public bool IsActive { get; set; } = true;
        public Guid? ParentId { get; set; }
        public QuizCategory Parent { get; set; }
        public ICollection<QuizCategory> Children { get; set; }
        public ICollection<QuestionBank> QuestionBanks { get; set; }
        public ICollection<Quiz> Quizzes { get; set; }
    }
}
