using Microsoft.AspNetCore.Mvc;
using OnlineTestSystem.BLL.Services.DoQuizService;
using OnlineTestSystem.BLL.Services.QuizService;
using OnlineTestSystem.BLL.ViewModels.Quiz;
using OnlineTestSystem.BLL.ViewModels.QuizCategory;
using OnlineTestSystem.BLL.ViewModels.UserQuiz;
using OnlineTestSystem.DAL.Models;

namespace OnlineTestSystem.Presentation.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class QuizController : ControllerBase
    {
        private readonly IQuizService _quizService;
        private readonly IUserQuizService _userQuizService;
        private readonly IUserAnswerService _userAnswerService;

        public QuizController(IQuizService quizService, IUserQuizService userQuizService, IUserAnswerService userAnswerService)
        {
            _quizService = quizService;
            _userQuizService = userQuizService;
            _userAnswerService = userAnswerService;
        }

        [HttpGet("get-all-quiz")]
        public async Task<IActionResult> GetAllQuiz()
        {
            var quizzes = await _quizService.GetAllAsync();
            var quizzesVm = new List<QuizVm>();
            foreach (var quiz in quizzes)
            {
                quizzesVm.Add(new QuizVm
                {
                    Id = quiz.Id,
                    Category = quiz.Category,
                    Title = quiz.Title,
                    Description = quiz.Description,
                    Duration = quiz.Duration,
                    IsActive = quiz.IsActive,
                    CreatedAt = quiz.CreatedAt,
                });
            }
            return Ok(quizzesVm);
        }

        [HttpGet("get-quiz-by-id/{id}")]
        public async Task<IActionResult> GetQuizById(Guid id)
        {
            var quiz = await _quizService.GetByIdAsync(id);
            if (quiz != null)
            {
                var quizVm = new QuizVm()
                {
                    Id = quiz.Id,
                    Category = quiz.Category,
                    Title = quiz.Title,
                    Description = quiz.Description,
                    Duration = quiz.Duration,
                    IsActive = quiz.IsActive,
                    CreatedAt = quiz.CreatedAt,
                };
                return Ok(quizVm);
            }
            return BadRequest("The quiz does not exist!");
        }

        [HttpPost("Filter")]
        public async Task<IActionResult> FilteQuiz([FromQuery] int pageIndex, int pageSize,
                                                   [FromBody] FilterQuizVm filterRequest,
                                                   [FromQuery] string sortBy = "createdAt", string sortOrder = "desc")
        {
            if (pageIndex <= 0 || pageSize <= 0)
            {
                return BadRequest(new { message = "PageIndex and PageSize must be greater than 0." });
            }

            try
            {
                var quizzes = await _quizService.FilterQuizzesAsync(filterRequest, pageIndex, pageSize, sortBy, sortOrder);
                return Ok(quizzes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }

        }

        [HttpPost("add-new-quiz")]
        public async Task<IActionResult> AddNewQuiz([FromBody] AddQuizVm addQuizVm)
        {
            var quiz = new Quiz()
            {
                Id = Guid.NewGuid(),
                Category = addQuizVm.Category,
                Title = addQuizVm.Title,
                Description = addQuizVm.Description,
                Duration = addQuizVm.Duration,
                IsActive = addQuizVm.IsActive,
                CreatedAt = DateTime.Now,
            };
            var result = await _quizService.AddAsync(quiz);
            if (result > 0)
            {
                return Ok(new { message = "Quiz created successfully." });
            }
            return BadRequest(new { message = "Failed to created quiz" });
        }

        [HttpPut("update-quiz/{id}")]
        public async Task<IActionResult> UpdateQuiz(Guid id, [FromBody] AddQuizVm addQuizVm)
        {
            var quiz = await _quizService.GetByIdAsync(id);
            if (quiz != null)
            {
                quiz.Category = addQuizVm.Category;
                quiz.Title = addQuizVm.Title;
                quiz.Description = addQuizVm.Description;
                quiz.Duration = addQuizVm.Duration;
                quiz.IsActive = addQuizVm.IsActive;

                var result = await _quizService.UpdateAsync(quiz);
                if (result > 0)
                {
                    return Ok(new { message = "Quiz updated successfully." });
                }
                return BadRequest(new { message = "Failed to updated quiz" });
            }
            return NotFound(new { message = "The quiz does not exist!" });
        }

        [HttpDelete("delete-quiz/{id}")]
        public async Task<IActionResult> DeleteQuiz(Guid id)
        {
            var quiz = await _quizService.GetByIdAsync(id);
            if (quiz != null)
            {
                await _quizService.DeleteAsync(quiz);
                return Ok("Delete Successful");
            }
            return BadRequest("Delete Faild!");
        }

        // random generate quiz
        [HttpPost("random-generate")]
        public async Task<IActionResult> RandomGenerate([FromBody] RandomQuizCreateRequest request)
        {
            if (request == null)
                return BadRequest("Request không hợp lệ.");

            try
            {
                var quizzes = await _quizService.GenerateRandomQuizzesAsync(
                    request.QuestionBankId,
                    request.NumberOfQuestionsPerQuiz,
                    request.NumberOfQuizzes,
                    request.Duration);

                return Ok(quizzes.Select(q => new
                {
                    q.Id,
                    q.Title,
                    q.Description,
                    q.Duration,
                    q.CreatedAt
                }));
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }



        // Do Quiz Exam
        [HttpPost("{quizId}/start")]
        public async Task<IActionResult> StartQuiz(Guid quizId,[FromBody] AddUserQuizVm startQuizVm)
        {
            var userQuiz = new UserQuiz()
            {
                Id = Guid.NewGuid(),
                UserId = startQuizVm.UserId,
                QuizId = quizId,
                ExamId = startQuizVm.ExamId,
                FinishedAt = DateTime.Now,
                Score = 0
            };
            await _userQuizService.AddAsync(userQuiz);
            return Ok("Start Quiz");
        }

        [HttpPut("userQuiz/{id}/submit")]
        public async Task<IActionResult> SubmitQuiz(Guid id, [FromBody] AddUserQuizVm startQuizVm)
        {
            var userQuiz = await _userQuizService.GetByIdAsync(id);
            if (userQuiz != null)
            {
                userQuiz.FinishedAt = DateTime.Now;
                userQuiz.IsComplete = true;

                await _userQuizService.UpdateAsync(userQuiz);
                return Ok("Submit Successful");
            }
            return BadRequest("failed");
        }

        [HttpPost("{userQuizId}/record")]
        public async Task<IActionResult> RecordAnswer(Guid userQuizId, [FromBody] AddUserAnswerVm recordAnswerVm)
        {
            var userAnswer = new UserAnswer()
            {
                Id = Guid.NewGuid(),
                UserQuizId = userQuizId,
                QuestionId = recordAnswerVm.QuestionId,
                AnswerId = recordAnswerVm.AnswerId,
                UserVoiceUrl = recordAnswerVm.UserVoiceUrl,
                AnswerText = recordAnswerVm.AnswerText
            };
            await _userAnswerService.AddAsync(userAnswer);
            return Ok("Record Answer");
        }
    }
}
