using OnlineTestSystem.BLL.Services.Base;
using OnlineTestSystem.BLL.ViewModels;
using OnlineTestSystem.BLL.ViewModels.Exam;
using OnlineTestSystem.BLL.ViewModels.QuizCategory;
using OnlineTestSystem.DAL.Infrastructure;
using OnlineTestSystem.DAL.Models;

namespace OnlineTestSystem.BLL.Services.QuizCategoryService
{
    public class QuizCategoryService : BaseService<QuizCategory>, IQuizCategoryService
    {
        public QuizCategoryService(IUnitOfWork unitOfWork) : base(unitOfWork)
        {
        }

        public async Task<PaginatedResult<QuizCategoryVm>> FilterCategoriesAsync(FilterCategoryVm filterRequest,
                                                               int pageIndex,
                                                               int pageSize,
                                                               string sortBy,
                                                               string sortOrder)
        {
            var query = _unitOfWork.GenericRepository<QuizCategory>().GetQuery();

            if (filterRequest.Id.HasValue)
            {
                query = query.Where(c => c.Id != filterRequest.Id.Value);
            }

            if (!string.IsNullOrEmpty(filterRequest.Name))
            {
                query = query.Where(c => c.Name.Contains(filterRequest.Name));
            }

            if (!string.IsNullOrEmpty(filterRequest.Description))
            {
                query = query.Where(c => c.Description.Contains(filterRequest.Description));
            }

            if (filterRequest.IsActive.HasValue)
            {
                query = query.Where(c => c.IsActive == filterRequest.IsActive);
            }

            if (filterRequest.ParentId.HasValue)
                query = query.Where(c => c.ParentId == filterRequest.ParentId);

            if (!string.IsNullOrEmpty(filterRequest.ParentName))
            {
                query = query.Where(c => c.Parent.Name.Contains(filterRequest.ParentName));
            }


            if (!string.IsNullOrEmpty(sortBy))
            {
                if (sortOrder.ToLower() == "asc")
                {
                    query = query.OrderByDynamic(sortBy, true); 
                }
                else
                {
                    query = query.OrderByDynamic(sortBy, false); 
                }
            }

            var categories = query.Select(cate => new QuizCategoryVm
            {
                Id = cate.Id,
                Name = cate.Name,
                Description = cate.Description,
                IsActive = cate.IsActive,
                ParentId = cate.ParentId,
                ParentName = cate.Parent.Name,
            });


            return await PaginatedResult<QuizCategoryVm>.CreateAsync(categories, pageIndex, pageSize);
        }

    }
}
