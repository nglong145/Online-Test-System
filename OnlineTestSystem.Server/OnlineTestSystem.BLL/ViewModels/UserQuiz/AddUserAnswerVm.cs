namespace OnlineTestSystem.BLL.ViewModels.UserQuiz
{
    public class AddUserAnswerVm
    {
        public Guid QuestionId { get; set; }
        public Guid AnswerId { get; set; }
        public string? UserVoiceUrl { get; set; }
        public string? AnswerText { get; set; }  
        public bool IsCorrect { get; set; }  
    }
}
