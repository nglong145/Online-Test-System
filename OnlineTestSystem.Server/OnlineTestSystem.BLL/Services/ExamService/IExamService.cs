using OnlineTestSystem.BLL.Services.Base;
using OnlineTestSystem.BLL.ViewModels;
using OnlineTestSystem.BLL.ViewModels.Exam;
using OnlineTestSystem.BLL.ViewModels.ExamExtend;
using OnlineTestSystem.BLL.ViewModels.ExamQuiz;
using OnlineTestSystem.BLL.ViewModels.Group;
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
    }

    public interface IExamGroupService : IBaseService<ExamGroup>
    {
        Task<bool> AddGroupToExamAsync(Guid examId, Guid groupId);
        Task<bool> RemoveGroupFromExamAsync(Guid examId, Guid groupId);
    }

    public interface IExamParticipantService : IBaseService<ExamParticipant>
    {
        Task<bool> AddUserToExamAsync(Guid examId, Guid userId, AddUserToExamVm vm);
        Task<bool> RemoveUserFromExamAsync(Guid examId, Guid userId);
    }

    public interface IExamQuizService : IBaseService<ExamQuiz>
    {
        Task<PaginatedResult<ExamQuizVm>> FilterExamQuizzesAsync(FilterExamQuizVm filterRequest, int pageIndex, int pageSize);
        Task<bool> AddQuizToExamAsync(Guid examId, Guid quizId, AddQuizToExamVm vm);
        
        Task<bool> RemoveQuizFromExamAsync(Guid examId, Guid quizId);
    }
}
