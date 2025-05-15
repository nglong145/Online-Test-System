namespace OnlineTestSystem.BLL.ViewModels.Answer
{
    public class AnswerVm
    {
        public Guid Id { get; set; }
        public string Content { get; set; }
        public bool IsCorrect { get; set; }
        public bool IsActive { get; set; } = true;
        public Guid QuestionId { get; set; }
    }
}
