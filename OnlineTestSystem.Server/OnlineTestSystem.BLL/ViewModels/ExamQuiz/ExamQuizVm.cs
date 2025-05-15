namespace OnlineTestSystem.BLL.ViewModels.ExamQuiz
{
    public class ExamQuizVm
    {
        public Guid ExamId { get; set; }
        public string ExamName { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public Guid QuizId { get; set; }
        public string Title { get; set; }
        public int TotalQuestion {  get; set; }
        public int Duration { get; set; }
    }
}
