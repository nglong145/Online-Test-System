namespace OnlineTestSystem.DAL.Models
{
    public class QuestionBank
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public Guid? OwnerId { get; set; }
        public virtual User Owner { get; set; }
        public Guid? QuizCategoryId { get; set; }
        public QuizCategory QuizCategory { get; set; }
        public ICollection<Question> Questions { get; set; }
    }
}
