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
                    Order=question.Order,
                    QuestionType = question.QuestionType.ToString(),
                    AudioUrl = question.AudioUrl,
                    IsActive = question.IsActive,
                    CreatedAt = question.CreatedAt,
                    Level = question.Level.ToString(),
                    BankId= question.BankId
                });

            return await PaginatedResult<QuestionVm>.CreateAsync(query, pageIndex, pageSize);
        }


        public async Task<int> RemoveQuestionAndReorderAsync(Guid questionId)
        {
            // Get question delete
            var question = await _unitOfWork.GenericRepository<Question>().GetByIdAsync(questionId);
            if (question == null) return 0;

            var bankId = question.BankId;

            // delete question
            _unitOfWork.GenericRepository<Question>().Delete(question);
            await _unitOfWork.SaveChangesAsync();

            // get list question with same bankId
            var remainingQuestions = _unitOfWork.GenericRepository<Question>()
                .GetQuery(q => q.BankId == bankId)
                .OrderBy(q => q.Order)
                .ToList();

            // Update order
            for (int i = 0; i < remainingQuestions.Count; i++)
            {
                remainingQuestions[i].Order = i + 1;
                _unitOfWork.GenericRepository<Question>().Update(remainingQuestions[i]);
            }

            return await _unitOfWork.SaveChangesAsync();
        }
    }
}
