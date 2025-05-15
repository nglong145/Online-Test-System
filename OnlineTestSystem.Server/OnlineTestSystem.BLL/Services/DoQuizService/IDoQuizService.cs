using OnlineTestSystem.BLL.Services.Base;
using OnlineTestSystem.BLL.ViewModels.UserQuiz;
using OnlineTestSystem.BLL.ViewModels;
using OnlineTestSystem.DAL.Models;

namespace OnlineTestSystem.BLL.Services.DoQuizService
{
    // UserQuiz
    public interface IUserQuizService : IBaseService<UserQuiz>
    {
        Task<PaginatedResult<UserQuizVm>> FilterUserQuizzesAsync(FilterUserQuizVm filterRequest, int pageIndex, int pageSize, string sortBy, string sortOrder);
    }

    // UserAnswer
    public interface IUserAnswerService : IBaseService<UserAnswer>
    {

    }
}
