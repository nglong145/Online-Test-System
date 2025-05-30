using OnlineTestSystem.BLL.Services.Base;
using OnlineTestSystem.BLL.ViewModels.UserQuiz;
using OnlineTestSystem.BLL.ViewModels;
using OnlineTestSystem.DAL.Models;

namespace OnlineTestSystem.BLL.Services.DoQuizService
{
    // UserQuiz
    public interface IDoQuizService : IBaseService<UserQuiz>
    {
        Task<bool> HasUserParticipatedInExamAsync(Guid userId, Guid examId);
        Task<(bool Success, string? ErrorMessage, Guid? UserQuizId)> StartUserQuizAsync(Guid quizId, AddUserQuizVm vm);
        Task<PaginatedResult<UserQuizVm>> FilterUserQuizzesAsync(FilterUserQuizVm filterRequest, int pageIndex, int pageSize, string sortBy, string sortOrder);
        Task<bool> SubmitUserQuizAndCalculateScoreAsync(Guid userQuizId, float? submittedScore = null);

        Task<UserQuizDetailVm?> GetUserQuizDetailAsync(Guid userQuizId);

        Task<DoingUserQuizVm?> GetDoingUserQuizAsync(Guid examId, Guid userId);

        Task<byte[]> ExportUserQuizToExcelAsync(Guid examId);
        Task<byte[]> ExportUserQuizByUserToExcelAsync(Guid examId,Guid userId);
    }

    // UserAnswer
    public interface IUserAnswerService : IBaseService<UserAnswer>
    {
        Task<bool> AddOrUpdateUserAnswerAsync(Guid userQuizId, AddUserAnswerVm vm);
    }
}
