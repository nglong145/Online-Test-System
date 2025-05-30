using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using OnlineTestSystem.BLL.Services.QuestionService;
using OnlineTestSystem.BLL.Services.QuizService;
using OnlineTestSystem.BLL.ViewModels.Question;
using OnlineTestSystem.BLL.ViewModels.Quiz;
using OnlineTestSystem.DAL.Models;

namespace OnlineTestSystem.Presentation.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class QuestionController : ControllerBase
    {
        private readonly IQuestionService _questionService;

        public QuestionController(IQuestionService questionService)
        {
            _questionService = questionService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllQuestion()
        {
            var questions = await _questionService.GetAllAsync();
            var questionsVm = new List<QuestionVm>();
            foreach (var question in questions)
            {
                questionsVm.Add(new QuestionVm
                {
                    Id = question.Id,
                    Content = question.Content,
                    Order = question.Order,
                    QuestionType = question.QuestionType.ToString(),
                    AudioUrl = question.AudioUrl,
                    IsActive = question.IsActive,
                    CreatedAt = question.CreatedAt,
                    Level = question.Level.ToString(),
                    BankId = question.BankId
                });
            }
            return Ok(questionsVm);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetQuestionById(Guid id)
        {
            var question = await _questionService.GetByIdAsync(id);
            if (question != null)
            {
                var questionVm = new QuestionVm()
                {
                    Id = question.Id,
                    Content = question.Content,
                    Order = question.Order,
                    QuestionType = question.QuestionType.ToString(),
                    AudioUrl = question.AudioUrl,
                    IsActive = question.IsActive,
                    CreatedAt = question.CreatedAt,
                    Level = question.Level.ToString(),
                    BankId = question.BankId,
                };
                return Ok(questionVm);
            }
            return BadRequest("The question does not exist!");
        }

        [HttpGet("Get-All-Question-Pagination")]
        public async Task<IActionResult> GetAllQuestionPagination([FromQuery] int pageIndex, int pageSize)
        {
            if (pageIndex <= 0 || pageSize <= 0)
            {
                return BadRequest(new { message = "PageIndex and PageSize must be greater than 0." });
            }

            var questions = await _questionService.GetQuestionListPaginationAsync(pageIndex, pageSize);
            return Ok(questions);

        }

        [HttpPost]
        public async Task<IActionResult> AddNewQuestion([FromBody] AddQuestionVm addQuestionVm)
        {
            var question = new Question()
            {
                Id = Guid.NewGuid(),
                Content = addQuestionVm.Content,
                Order = addQuestionVm.Order,
                QuestionType = Enum.Parse<QuestionType>(addQuestionVm.QuestionType),
                AudioUrl = addQuestionVm.AudioUrl,
                IsActive = addQuestionVm.IsActive,
                CreatedAt = DateTime.Now,
                Level = Enum.Parse<QuestionLevel>(addQuestionVm.Level),
                BankId = addQuestionVm.BankId,
            };
            await _questionService.AddAsync(question);
            return Ok(question);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateQuestion(Guid id, [FromBody] AddQuestionVm addQuestionVm)
        {
            var question = await _questionService.GetByIdAsync(id);
            if (question != null)
            {
                question.Content = addQuestionVm.Content;
                question.Order = addQuestionVm.Order;
                question.QuestionType = Enum.Parse<QuestionType>(addQuestionVm.QuestionType);
                question.AudioUrl = addQuestionVm.AudioUrl;
                question.IsActive = addQuestionVm.IsActive;
                question.Level = Enum.Parse<QuestionLevel>(addQuestionVm.Level);
                question.BankId = addQuestionVm.BankId;

                await _questionService.UpdateAsync(question);
                return Ok(question);
            }
            return BadRequest("The quiz does not exist!");
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteQuestion(Guid id)
        {
            var question = await _questionService.GetByIdAsync(id);
            if (question != null)
            {
                await _questionService.RemoveQuestionAndReorderAsync(id);
                return Ok("Delete Successful");
            }
            return BadRequest("Delete Faild!");
        }
    }
}
