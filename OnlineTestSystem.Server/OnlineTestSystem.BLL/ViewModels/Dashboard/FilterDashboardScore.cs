namespace OnlineTestSystem.BLL.ViewModels.Dashboard
{
    public class FilterDashboardScore
    {
        public Guid? ExamId { get; set; }
        public string? ExamName { get; set; }
        public DateTime? StartDate { get; set; }
        public  DateTime? EndDate { get; set; }
        public double? PassingScore { get; set; }
    }
}
