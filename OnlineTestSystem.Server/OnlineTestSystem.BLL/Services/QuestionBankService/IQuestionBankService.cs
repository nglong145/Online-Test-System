using OnlineTestSystem.BLL.Services.Base;
using OnlineTestSystem.BLL.ViewModels;
using OnlineTestSystem.BLL.ViewModels.QuestionBank;
using OnlineTestSystem.DAL.Models;

namespace OnlineTestSystem.BLL.Services.QuestionBankService
{
    public interface IQuestionBankService : IBaseService<QuestionBank>
    {
        Task<PaginatedResult<QuestionBankVm>> FilterBanksAsync(FilterBankVm filterRequest,
                                                                int pageIndex,
                                                                int pageSize,
                                                                string sortBy,
                                                                string sortOrder);

        Task<Guid> ImportFromFileAsync(Stream fileStream, string fileName, AddQuestionBankVm bankVm);
    }
}
