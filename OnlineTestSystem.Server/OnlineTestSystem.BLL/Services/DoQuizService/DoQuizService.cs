using Microsoft.EntityFrameworkCore;
using OnlineTestSystem.BLL.Services.Base;
using OnlineTestSystem.BLL.ViewModels.UserQuiz;
using OnlineTestSystem.BLL.ViewModels;
using OnlineTestSystem.DAL.Infrastructure;
using OnlineTestSystem.DAL.Models;

namespace OnlineTestSystem.BLL.Services.DoQuizService
{
    public class UserQuizService : BaseService<UserQuiz>, IUserQuizService
    {
        // UserQuiz
        public UserQuizService(IUnitOfWork unitOfWork) : base(unitOfWork)
        {
        }
        public async Task<PaginatedResult<UserQuizVm>> FilterUserQuizzesAsync(FilterUserQuizVm filterRequest, int pageIndex, int pageSize, string sortBy, string sortOrder)
        {
            var query = _unitOfWork.GenericRepository<UserQuiz>().GetQuery();

            if (filterRequest.UserId.HasValue)
                query = query.Where(q => q.UserId == filterRequest.UserId);

            if (!string.IsNullOrEmpty(filterRequest.StudentCode))
            {
                query = query.Where(q => q.User != null && q.User.StudentCode.Contains(filterRequest.StudentCode));
            }

            if (!string.IsNullOrEmpty(filterRequest.FullName))
            {
                query = query.Where(q => q.User != null && q.User.FirstName.Contains(filterRequest.FullName) || q.User.LastName.Contains(filterRequest.FullName));
            }

            if (filterRequest.ExamId.HasValue)
                query = query.Where(q => q.ExamId == filterRequest.ExamId);

            if (!string.IsNullOrEmpty(filterRequest.ExamName))
                query = query.Where(q => q.Exam != null && q.Exam.Name.Contains(filterRequest.ExamName));

            if (filterRequest.QuizId.HasValue)
                query = query.Where(q => q.QuizId == filterRequest.QuizId);

            if (!string.IsNullOrEmpty(filterRequest.QuizName))
                query = query.Where(q => q.Quiz != null && q.Quiz.Title.Contains(filterRequest.QuizName));

            if (filterRequest.StartDate.HasValue)
                query = query.Where(q => q.StartedAt >= filterRequest.StartDate);

            if (filterRequest.EndDate.HasValue)
                query = query.Where(q => q.StartedAt <= filterRequest.EndDate);

            if (filterRequest.Score.HasValue)
                query = query.Where(q => q.Score >= filterRequest.Score);

            query = query.Include(q => q.Quiz)
                         .Include(q => q.Exam)
                         .Include(q => q.User);

            if (!string.IsNullOrEmpty(sortBy))
            {
                if (sortOrder.ToLower() == "asc")
                    query = query.OrderByDynamic(sortBy, true);
                else
                    query = query.OrderByDynamic(sortBy, false);
            }

            var resultQuery = query.Select(q => new UserQuizVm
            {
                Id= q.Id,
                UserId = q.UserId,
                StudentCode=q.User.StudentCode,
                FirstName = q.User.FirstName,
                LastName = q.User.LastName,
                ExamId = q.ExamId,
                ExamName = q.Exam != null ? q.Exam.Name : "",
                QuizId = q.QuizId,
                QuizName = q.Quiz != null ? q.Quiz.Title : "",
                StartedAt = q.StartedAt,
                FinishedAt = q.FinishedAt,
                Score = q.Score,
                IsComplete = q.IsComplete
            });

            return await PaginatedResult<UserQuizVm>.CreateAsync(resultQuery, pageIndex, pageSize);
        }

    }

    // UserAnswer
    public class UserAnswerService : BaseService<UserAnswer>, IUserAnswerService
    {

        public UserAnswerService(IUnitOfWork unitOfWork) : base(unitOfWork)
        {
        }

    }
}
