using OnlineTestSystem.BLL.Services.Base;
using OnlineTestSystem.BLL.ViewModels;
using OnlineTestSystem.BLL.ViewModels.Exam;
using OnlineTestSystem.BLL.ViewModels.ExamExtend;
using OnlineTestSystem.BLL.ViewModels.ExamParticipant;
using OnlineTestSystem.BLL.ViewModels.ExamQuiz;
using OnlineTestSystem.BLL.ViewModels.Group;
using OnlineTestSystem.BLL.ViewModels.Quiz;
using OnlineTestSystem.BLL.ViewModels.User;
using OnlineTestSystem.DAL.Models;

namespace OnlineTestSystem.BLL.Services.ExamService
{
    public interface IExamService : IBaseService<Exam>
    {
        Task<PaginatedResult<ExamVm>> GetExamListPaginationAsync(int pageIndex, int pageSize);
        Task<PaginatedResult<ExamVm>> FilterExamsAsync(FilterExamVm filterRequest,
                                                             int pageIndex,
                                                             int pageSize,
                                                             string sortBy,
                                                             string sortOrder);
        Task<PaginatedResult<ExamVm>> FilterExamsUpcomingAsync(FilterExamVm filterRequest,
                                                              int pageIndex,
                                                              int pageSize,
                                                              string sortBy,
                                                              string sortOrder);

        Task<PaginatedResult<ExamVm>> FilterExamsOncomingAsync(FilterExamVm filterRequest,
                                                              int pageIndex,
                                                              int pageSize,
                                                              string sortBy,
                                                              string sortOrder);
    }

    public interface IExamGroupService : IBaseService<ExamGroup>
    {
        Task<bool> ExamGroupExistsAsync(Guid examId, Guid groupId);
        Task<bool> AddGroupToExamAsync(Guid examId, Guid groupId);
        Task<bool> RemoveGroupFromExamAsync(Guid examId, Guid groupId);
        Task<PaginatedResult<ExamGroupVm>> FilterExamGroupsAsync(FilterExamGroupVm filterRequest,
                                                              int pageIndex,
                                                              int pageSize,
                                                              string sortBy,
                                                              string sortOrder);
    }

    public interface IExamParticipantService : IBaseService<ExamParticipant>
    {
        Task<bool> ExamUserExistsAsync(Guid examId, Guid userId);
        Task<bool> AddUserToExamAsync(Guid examId, Guid userId, AddUserToExamVm vm);
        Task<bool> RemoveUserFromExamAsync(Guid examId, Guid userId);
        Task<PaginatedResult<ExamParticipantVm>> FilterExamUsersAsync(FilterExamUserVm filterRequest,
                                                             int pageIndex,
                                                             int pageSize,
                                                             string sortBy,
                                                             string sortOrder);

        Task<PaginatedResult<ExamParticipantVm>> FilterUpcomingExamsAsync(FilterExamUserVm filterRequest,
                                                             int pageIndex,
                                                             int pageSize,
                                                             string sortBy,
                                                             string sortOrder);

        Task<PaginatedResult<ExamParticipantVm>> FilterOncomingExamsAsync(FilterExamUserVm filterRequest,
                                                           int pageIndex,
                                                           int pageSize,
                                                           string sortBy,
                                                           string sortOrder);
        Task<byte[]> ExportExamParticipantListToExcelAsync(Guid examId);
    }

    public interface IExamQuizService : IBaseService<ExamQuiz>
    {
        Task<bool> ExamQuizExistsAsync(Guid examId, Guid quizId);
        Task<PaginatedResult<ExamQuizVm>> FilterExamQuizzesAsync(FilterExamQuizVm filterRequest, int pageIndex, int pageSize, string sortBy,
                                                             string sortOrder);
        Task<bool> AddQuizToExamAsync(Guid examId, Guid quizId);
        
        Task<bool> RemoveQuizFromExamAsync(Guid examId, Guid quizId);

        Task<QuizWithDetailVm?> GetRandomQuizForExamAsync(Guid examId);
    }
}
