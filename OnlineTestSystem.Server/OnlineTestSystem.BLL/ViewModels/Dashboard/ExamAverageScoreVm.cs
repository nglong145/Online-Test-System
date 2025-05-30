namespace OnlineTestSystem.BLL.ViewModels.Dashboard
{
    public class ExamAverageScoreVm
    {
        public Guid? ExamId { get; set; }
        public string ExamName { get; set; }
        public double AverageScore { get; set; }
        public int SubmitCount { get; set; }
        public double MinScore { get; set; }
        public double MaxScore { get; set; }
        public double PassRate { get; set; }
    }
}
