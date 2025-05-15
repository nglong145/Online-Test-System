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

    }
}
