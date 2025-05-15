using OnlineTestSystem.BLL.Services.Base;
using OnlineTestSystem.BLL.ViewModels;
using OnlineTestSystem.BLL.ViewModels.QuizCategory;
using OnlineTestSystem.DAL.Models;

namespace OnlineTestSystem.BLL.Services.QuizCategoryService
{
    public interface IQuizCategoryService : IBaseService<QuizCategory>
    {
        Task<PaginatedResult<QuizCategoryVm>> FilterCategoriesAsync(FilterCategoryVm filterRequest,
                                                              int pageIndex,
                                                              int pageSize,
                                                              string sortBy,
                                                              string sortOrder);
    }
}
