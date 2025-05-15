namespace OnlineTestSystem.BLL.ViewModels.QuizQuestion
{
    public class QuizQuestionVm
    {
        public Guid QuizId { get; set; }
        public string QuizName { get; set; }
        public Guid QuestionId { get; set; }
        public string QuestionName { get; set; }
        public int Order { get; set; }
        public float Score { get; set; }
    }
}
