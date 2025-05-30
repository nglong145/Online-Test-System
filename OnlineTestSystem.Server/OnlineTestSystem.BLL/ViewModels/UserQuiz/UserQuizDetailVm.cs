namespace OnlineTestSystem.BLL.ViewModels.UserQuiz
{
    public class UserQuizDetailVm
    {
        public Guid UserQuizId { get; set; }
        public Guid UserId { get; set; }
        public string? StudentCode { get; set; }
        public string FullName { get; set; }
        public Guid? ExamId { get; set; }
        public string ExamName { get; set; }
        public Guid? QuizId { get; set; }
        public string QuizName { get; set; }
        public int Duration { get; set; }   
        public DateTime StartedAt { get; set; }
        public DateTime FinishedAt { get; set; }
        public float? Score { get; set; }
        public bool IsComplete { get; set; }
        public List<UserQuizQuestionDetailVm> Questions { get; set; }
    }
}
