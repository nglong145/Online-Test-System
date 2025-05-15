namespace OnlineTestSystem.BLL.ViewModels.UserQuiz
{
    public class FilterUserQuizVm
    {
        public Guid? UserId { get; set; }
        public string? StudentCode { get; set; }
        public string? FullName { get; set; }
        public Guid? ExamId { get; set; }
        public string? ExamName { get; set; }
        public Guid? QuizId { get; set; }
        public string? QuizName { get; set; }
        public DateTime? StartDate { get; set; }  // Ngày bắt đầu
        public DateTime? EndDate { get; set; }    // Ngày kết thúc
        public float? Score { get; set; }
    }
}
