namespace OnlineTestSystem.BLL.ViewModels.UserQuiz
{
    public class UserQuizVm
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string? StudentCode { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public Guid? ExamId { get; set; }
        public string ExamName { get; set; }    
        public Guid? QuizId { get; set; }
        public string QuizName { get; set; }
        public DateTime StartedAt { get; set; }
        public DateTime FinishedAt { get; set; }
        public float? Score { get; set; }
        public bool IsComplete { get; set; }
    }
}
