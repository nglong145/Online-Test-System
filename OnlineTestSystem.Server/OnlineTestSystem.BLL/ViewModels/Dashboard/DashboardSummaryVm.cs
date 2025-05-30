namespace OnlineTestSystem.BLL.ViewModels.Dashboard
{
    public class DashboardSummaryVm
    {
        public int TotalUsers { get; set; }
        public int TotalStudents { get; set; }
        public int TotalTeachers { get; set; }
        public int TotalExams { get; set; }
        public int TotalQuizzes { get; set; }
        public int TotalGroups { get; set; }
        public int CompletedExamsCount { get; set; }
        public int RunningExamsCount { get; set; }
        public int FinishedExamsCount { get; set; }
    }
}
