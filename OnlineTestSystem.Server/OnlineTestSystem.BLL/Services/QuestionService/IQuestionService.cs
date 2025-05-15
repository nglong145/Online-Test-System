using OnlineTestSystem.BLL.Services.Base;
using OnlineTestSystem.BLL.ViewModels.Exam;
using OnlineTestSystem.BLL.ViewModels;
using OnlineTestSystem.DAL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using OnlineTestSystem.BLL.ViewModels.Question;

namespace OnlineTestSystem.BLL.Services.QuestionService
{
    public interface IQuestionService : IBaseService<Question>
    {
        Task<PaginatedResult<QuestionVm>> GetQuestionListPaginationAsync(int pageIndex, int pageSize);
    }
}
