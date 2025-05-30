namespace OnlineTestSystem.BLL.ViewModels.UserQuiz
{
    public class DoingUserQuizVm
    {
        public Guid UserQuizId { get; set; }
        public Guid UserId { get; set; }
        public Guid? ExamId { get; set; }
        public Guid QuizId { get; set; }
        public DateTime StartedAt { get; set; }
        public double RemainingTime { get; set; } // phút hoặc giây tuỳ FE muốn
        public bool IsTimeOver { get; set; }
        public List<UserQuizQuestionDetailVm> Questions { get; set; }
    }
}
