using OnlineTestSystem.BLL.Services.Base;
using OnlineTestSystem.BLL.ViewModels;
using OnlineTestSystem.BLL.ViewModels.Exam;
using OnlineTestSystem.DAL.Models;

namespace OnlineTestSystem.BLL.Services.AnswerService
{ 
    public interface IAnswerService : IBaseService<Answer>
    {
        Task<int> RemoveAnswerAndReorderAsync(Guid answerId);
    }

}
