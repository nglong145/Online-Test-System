using OnlineTestSystem.BLL.Services.Base;
using OnlineTestSystem.BLL.ViewModels;
using OnlineTestSystem.BLL.ViewModels.Quiz;
using OnlineTestSystem.BLL.ViewModels.QuizCategory;
using OnlineTestSystem.DAL.Models;

namespace OnlineTestSystem.BLL.Services.QuizService
{
    public interface IQuizService : IBaseService<Quiz>
    {

        Task<QuizWithDetailVm?> GetQuizFullDetailAsync(Guid quizId);
        Task<PaginatedResult<QuizVm>> FilterQuizzesAsync(FilterQuizVm filterRequest,
                                                                int pageIndex,
                                                                int pageSize,
                                                                string sortBy,
                                                                string sortOrder);

        Task<List<Quiz>> GenerateRandomQuizzesAsync(Guid questionBankId, int numberOfQuestionsPerQuiz, int numberOfQuizzes, float Score, int duration);
        Task<List<Quiz>> GenerateRandomQuizzesByLevelAsync(Guid questionBankId, int easyCount, int mediumCount, int hardCount, int numberOfQuizzes, int duration);
    }

    public interface IQuizQuestionService : IBaseService<QuizQuestion>
    {
    }
}
