using OnlineTestSystem.BLL.Services.Base;
using OnlineTestSystem.DAL.Infrastructure;
using OnlineTestSystem.DAL.Models;

namespace OnlineTestSystem.BLL.Services.AnswerService
{
    public class AnswerService : BaseService<Answer>, IAnswerService
    {
        public AnswerService(IUnitOfWork unitOfWork) : base(unitOfWork)
        {
        }

        public async Task<int> RemoveAnswerAndReorderAsync(Guid answerId)
        {
            // Get answer delete
            var answer = await _unitOfWork.GenericRepository<Answer>().GetByIdAsync(answerId);
            if (answer == null) return 0;

            var questionId = answer.QuestionId;

            // delete answer
            _unitOfWork.GenericRepository<Answer>().Delete(answer);
            await _unitOfWork.SaveChangesAsync();

            // get list answer with same questionId
            var remainingAnswers = _unitOfWork.GenericRepository<Answer>()
                .GetQuery(a => a.QuestionId == questionId)
                .OrderBy(a => a.Order)
                .ToList();

            // Update order
            for (int i = 0; i < remainingAnswers.Count; i++)
            {
                remainingAnswers[i].Order = i + 1;
                _unitOfWork.GenericRepository<Answer>().Update(remainingAnswers[i]);
            }

            return await _unitOfWork.SaveChangesAsync();
        }
    }
}
