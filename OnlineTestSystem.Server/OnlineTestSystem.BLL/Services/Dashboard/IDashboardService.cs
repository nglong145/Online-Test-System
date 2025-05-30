using OnlineTestSystem.BLL.ViewModels.Dashboard;

namespace OnlineTestSystem.BLL.Services.Dashboard
{
    public interface IDashboardService
    {
        Task<DashboardSummaryVm> GetSummaryAsync();
        Task<List<ExamAverageScoreVm>> GetExamAverageScoresAsync(FilterDashboardScore filter);
    }
}
