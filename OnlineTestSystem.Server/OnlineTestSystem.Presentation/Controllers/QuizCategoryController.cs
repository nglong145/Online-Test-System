using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using OnlineTestSystem.BLL.Services.ExamService;
using OnlineTestSystem.BLL.Services.QuizCategoryService;
using OnlineTestSystem.BLL.ViewModels.Exam;
using OnlineTestSystem.BLL.ViewModels.QuizCategory;
using OnlineTestSystem.DAL.Models;

namespace OnlineTestSystem.Presentation.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class QuizCategoryController : ControllerBase
    {
        private readonly IQuizCategoryService _categoryService;

        public QuizCategoryController(IQuizCategoryService categoryService)
        {
            _categoryService = categoryService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllQuizCategory()
        {
            var categories = await _categoryService.GetAllAsync();
            var categoryVm = new List<QuizCategoryVm>();
            foreach (var category in categories)
            {
                categoryVm.Add(new QuizCategoryVm
                {
                    Id = category.Id,
                    Name = category.Name,
                    Description = category.Description,
                    IsActive = category.IsActive,
                    ParentId = category.ParentId,
                });
            }
            return Ok(categoryVm);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetQuizCategoryById(Guid id)
        {
            var category = await _categoryService.GetByIdAsync(id);
            if (category != null)
            {
                var categoryVm = new QuizCategoryVm()
                {
                    Id = category.Id,
                    Name = category.Name,
                    Description = category.Description,
                    IsActive = category.IsActive,
                    ParentId = category.ParentId,
                };
                return Ok(categoryVm);
            }
            return BadRequest("The category does not exist!");
        }

        [HttpPost("Filter")]
        public async Task<IActionResult>FilteQuizCategory([FromQuery] int pageIndex, int pageSize ,
                                                   [FromBody] FilterCategoryVm filterRequest,
                                                   [FromQuery] string sortBy = "Name",string sortOrder = "desc")
        {
            if (pageIndex <= 0 || pageSize <= 0)
            {
                return BadRequest(new { message = "PageIndex and PageSize must be greater than 0." });
            }

            try
            {
                var categrories = await _categoryService.FilterCategoriesAsync(filterRequest, pageIndex, pageSize, sortBy, sortOrder);
                return Ok(categrories);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }

        }

        [HttpPost]
        public async Task<IActionResult> AddNewQuizCategory([FromBody] AddQuizCategoryVm addQuizCategoryVm)
        {
            var category = new QuizCategory()
            {
   
                Name = addQuizCategoryVm.Name,
                Description = addQuizCategoryVm.Description,
                IsActive = addQuizCategoryVm.IsActive,
                ParentId = addQuizCategoryVm.ParentId,
            };
            
            var result = await _categoryService.AddAsync(category);
            if (result > 0)
            {
                return Ok(new { message = "Category created successfully." });
            }
            return BadRequest(new { message = "Failed to created category" });
        }


        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateQuizCategory(Guid id, [FromBody] AddQuizCategoryVm addQuizCategoryVm)
        {
            var category = await _categoryService.GetByIdAsync(id);
            if (category != null)
            {
                category.Name = addQuizCategoryVm.Name;
                category.Description = addQuizCategoryVm.Description;
                category.IsActive = addQuizCategoryVm.IsActive;
                category.ParentId = addQuizCategoryVm.ParentId;
      
                var result = await _categoryService.UpdateAsync(category);
                if (result > 0)
                {
                    return Ok(new { message = "Cateogry updated successfully." });
                }
                return BadRequest(new { message = "Failed to updated category" });
            }
            return NotFound(new { message = "The category does not exist!" });
        }


        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteQuizCategory(Guid id)
        {
            var category = await _categoryService.GetByIdAsync(id);
            if (category != null)
            {
                var result = await _categoryService.DeleteAsync(category);
                if(result>0)
                {
                return Ok(new { message= "Delete Successful"});
                }
                return BadRequest(new { message = "Delete Faild!" });
            }
            return NotFound(new { message = "The category does not exist!" });
        }
    }
}
