using Microsoft.AspNetCore.Mvc;
using OnlineTestSystem.BLL.Services.AnswerService;
using OnlineTestSystem.BLL.ViewModels.Answer;
using OnlineTestSystem.DAL.Models;

namespace OnlineTestSystem.Presentation.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AnswerController : ControllerBase
    {
        private readonly IAnswerService _answerService;

        public AnswerController(IAnswerService answerService)
        {
            _answerService = answerService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllAnswer()
        {
            var answers = await _answerService.GetAllAsync();
            var answersVm = new List<AnswerVm>();
            foreach (var answer in answers)
            {
                answersVm.Add(new AnswerVm
                {
                    Id = answer.Id,
                    Content = answer.Content,
                    IsCorrect = answer.IsCorrect,
                    IsActive = answer.IsActive,
                    QuestionId = answer.QuestionId,
                });
            }
            return Ok(answersVm);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetAnswerById(Guid id)
        {
            var answer = await _answerService.GetByIdAsync(id);
            if (answer != null)
            {
                var answerVm = new AnswerVm()
                {
                    Id = answer.Id,
                    Content = answer.Content,
                    IsCorrect = answer.IsCorrect,
                    IsActive = answer.IsActive,
                    QuestionId = answer.QuestionId,
                };
                return Ok(answerVm);
            }
            return BadRequest("The answer does not exist!");
        }

        //[HttpGet("Get-All-Quiz-Category-Pagination")]
        //public async Task<IActionResult> GetAllQuizCategoryPagination([FromQuery] int pageIndex, int pageSize)
        //{
        //    if (pageIndex <= 0 || pageSize <= 0)
        //    {
        //        return BadRequest(new { message = "PageIndex and PageSize must be greater than 0." });
        //    }

        //    var categories = await _categoryService.GetCategoryListPaginationAsync(pageIndex, pageSize);
        //    return Ok(categories);

        //}

        [HttpPost]
        public async Task<IActionResult> AddNewAnswer([FromBody] AddAnswerVm addAnswerVm)
        {
            var answer = new Answer()
            {
                Content = addAnswerVm.Content,
                IsCorrect = addAnswerVm.IsCorrect,
                IsActive = addAnswerVm.IsActive,
                QuestionId = addAnswerVm.QuestionId
            };
            await _answerService.AddAsync(answer);
            return Ok(answer);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAnswer(Guid id, [FromBody] AddAnswerVm addAnswerVm)
        {
            var answer = await _answerService.GetByIdAsync(id);
            if (answer != null)
            {
                answer.Content = addAnswerVm.Content;
                answer.IsCorrect = addAnswerVm.IsCorrect;
                answer.IsActive = addAnswerVm.IsActive;
                answer.QuestionId = addAnswerVm.QuestionId;

                await _answerService.UpdateAsync(answer);
                return Ok(answer);
            }
            return BadRequest("The answer does not exist!");
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAnswer(Guid id)
        {
            var answer = await _answerService.GetByIdAsync(id);
            if (answer != null)
            {
                await _answerService.DeleteAsync(answer);
                return Ok("Delete Successful");
            }
            return BadRequest("Delete Faild!");
        }
    }
}
