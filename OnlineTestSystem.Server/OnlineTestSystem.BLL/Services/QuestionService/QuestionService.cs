using OnlineTestSystem.BLL.Services.Base;
using OnlineTestSystem.BLL.ViewModels;
using OnlineTestSystem.BLL.ViewModels.Exam;
using OnlineTestSystem.BLL.ViewModels.Question;
using OnlineTestSystem.DAL.Infrastructure;
using OnlineTestSystem.DAL.Models;

namespace OnlineTestSystem.BLL.Services.QuestionService
{
    public class QuestionService : BaseService<Question>, IQuestionService
    {
        public QuestionService(IUnitOfWork unitOfWork) : base(unitOfWork)
        {
        }

        public async Task<PaginatedResult<QuestionVm>> GetQuestionListPaginationAsync(int pageIndex, int pageSize)
        {
            var query = _unitOfWork.GenericRepository<Question>().Get()
                .Select(question => new QuestionVm
                {
                    Id = question.Id,
                    Content = question.Content,
                    QuestionType = question.QuestionType.ToString(),
                    AudioUrl = question.AudioUrl,
                    IsActive = question.IsActive,
                    CreatedAt = question.CreatedAt,
                    Level = question.Level.ToString(),
                    BankId= question.BankId
                });

            return await PaginatedResult<QuestionVm>.CreateAsync(query, pageIndex, pageSize);
        }
    }
}
