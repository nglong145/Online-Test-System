namespace OnlineTestSystem.BLL.ViewModels.UserQuiz
{
    public class AddUserQuizVm
    {
        public Guid UserId { get; set; }
        public Guid? ExamId { get; set; }
        public DateTime FinishedAt { get; set; }
        public float? Score { get; set; }
        public bool IsComplete { get; set; }
    }
}
