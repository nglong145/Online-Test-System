using Microsoft.EntityFrameworkCore;
using OnlineTestSystem.BLL.ViewModels.Dashboard;
using OnlineTestSystem.DAL.Infrastructure;
using OnlineTestSystem.DAL.Models;

namespace OnlineTestSystem.BLL.Services.Dashboard
{
    public class DashboardService : IDashboardService
    {
        private readonly IUnitOfWork _unitOfWork;

        public DashboardService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<DashboardSummaryVm> GetSummaryAsync()
        {
            var totalUsers = await _unitOfWork.GenericRepository<User>().GetQuery().CountAsync();

            // Nếu muốn phân biệt vai trò:
            var totalStudents = await _unitOfWork.GenericRepository<User>().GetQuery(u => u.Role.Name == "Student").CountAsync();
            var totalTeachers = await _unitOfWork.GenericRepository<User>().GetQuery(u => u.Role.Name == "Teacher").CountAsync();

            var totalExams = await _unitOfWork.GenericRepository<Exam>().GetQuery().CountAsync();
            var totalQuizzes = await _unitOfWork.GenericRepository<Quiz>().GetQuery().CountAsync();
            var totalGroups = await _unitOfWork.GenericRepository<Group>().GetQuery().CountAsync();

            // Tổng số lượt bài thi đã nộp (UserQuiz hoàn thành)
            var completedExamsCount = await _unitOfWork.GenericRepository<UserQuiz>()
                .GetQuery(uq => uq.IsComplete).CountAsync();

            // Số kỳ thi đang diễn ra
            var now = DateTime.Now;
            var runningExamsCount = await _unitOfWork.GenericRepository<Exam>()
                .GetQuery(e => e.StartTime <= now && (e.EndTime == null || e.EndTime >= now) && e.IsActive)
                .CountAsync();

            // Tổng số kỳ thi đã kết thúc
            var finishedExamsCount = await _unitOfWork.GenericRepository<Exam>()
                .GetQuery(e => e.EndTime != null && e.EndTime < now).CountAsync();

            return new DashboardSummaryVm
            {
                TotalUsers = totalUsers,
                TotalStudents = totalStudents,
                TotalTeachers = totalTeachers,
                TotalExams = totalExams,
                TotalQuizzes = totalQuizzes,
                TotalGroups = totalGroups,
                CompletedExamsCount = completedExamsCount,
                RunningExamsCount = runningExamsCount,
                FinishedExamsCount = finishedExamsCount
            };
        }

        public async Task<List<ExamAverageScoreVm>> GetExamAverageScoresAsync(FilterDashboardScore filter)
        {
            // Mặc định nếu client không truyền điểm chuẩn thì lấy 5.0
            var passingScore = filter.PassingScore ?? 5.0;

            var query = _unitOfWork.GenericRepository<UserQuiz>().GetQuery(uq => uq.IsComplete && uq.Exam.IsActive);

            if (filter.StartDate.HasValue && filter.EndDate.HasValue)
            {
                var start = filter.StartDate.Value;
                var end = filter.EndDate.Value;

                query = query.Where(uq =>
                    (uq.Exam.EndTime.HasValue ? uq.Exam.EndTime.Value >= start : uq.Exam.StartTime >= start) &&
                    uq.Exam.StartTime <= end);
            }
            else if (filter.StartDate.HasValue)
            {
                var start = filter.StartDate.Value;
                query = query.Where(uq =>
                    uq.Exam.EndTime.HasValue ? uq.Exam.EndTime.Value >= start : uq.Exam.StartTime >= start);
            }
            else if (filter.EndDate.HasValue)
            {
                var end = filter.EndDate.Value;
                query = query.Where(uq => uq.Exam.StartTime <= end);
            }

            var groupedData = await query
                .GroupBy(uq => new { uq.ExamId, uq.Exam.Name })
                .Select(g => new ExamAverageScoreVm
                {
                    ExamId = g.Key.ExamId,
                    ExamName = g.Key.Name ?? "",
                    AverageScore = g.Average(uq => (double?)uq.Score) ?? 0,
                    SubmitCount = g.Count(),
                    MinScore = g.Min(uq => (double?)uq.Score) ?? 0,
                    MaxScore = g.Max(uq => (double?)uq.Score) ?? 0,
                    PassRate = g.Count(uq => uq.Score >= passingScore) * 100.0 / g.Count()
                })
                .ToListAsync();

            return groupedData;
        }


    }
}

