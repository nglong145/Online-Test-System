using DocumentFormat.OpenXml.Office2010.Excel;
using Microsoft.AspNetCore.Mvc;
using OnlineTestSystem.BLL.Services.DoQuizService;
using OnlineTestSystem.BLL.Services.MailService;
using OnlineTestSystem.BLL.Services.QuizService;
using OnlineTestSystem.BLL.Services.UserService;
using OnlineTestSystem.BLL.ViewModels.Exam;
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
        private readonly IDoQuizService _userQuizService;
        private readonly IUserAnswerService _userAnswerService;
        private readonly IEmailService _emailService;
        private readonly IUserService _userService;


        public QuizController(IQuizService quizService, IDoQuizService userQuizService, IUserAnswerService userAnswerService, 
                              IEmailService emailService, IUserService userService)
        {
            _quizService = quizService;
            _userQuizService = userQuizService;
            _userAnswerService = userAnswerService;
            _emailService = emailService;
            _userService = userService;
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

        [HttpGet("{id}/full-detail")]
        public async Task<IActionResult> GetFullBankDetail(Guid id)
        {
            var result = await _quizService.GetQuizFullDetailAsync(id);
            if (result == null)
                return NotFound(new { message = "Không tìm thấy đề thi." });

            return Ok(result);
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
                    request.Score,
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

        // random generate quiz by level
        [HttpPost("random-generate-by-level")]
        public async Task<IActionResult> RandomGenerateByLevel([FromBody] RandomQuizLevelCreateRequest request)
        {
            if (request == null)
                return BadRequest("Request không hợp lệ.");

            try
            {
                var quizzes = await _quizService.GenerateRandomQuizzesByLevelAsync(
                    request.QuestionBankId,
                    request.EasyCount,
                    request.MediumCount,
                    request.HardCount,
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


        // check user participated in exam
        [HttpGet("exam/{examId}/user/{userId}/check-participation")]
        public async Task<IActionResult> CheckUserParticipation(Guid examId, Guid userId)
        {
            var participated = await _userQuizService.HasUserParticipatedInExamAsync(userId, examId);
            return Ok(new { message = participated });
        }

        // Do Quiz Exam

        [HttpPost("{quizId}/start")]
        public async Task<IActionResult> StartQuiz(Guid quizId,[FromBody] AddUserQuizVm startQuizVm)
        {
            var (success, error, userQuizId) = await _userQuizService.StartUserQuizAsync(quizId, startQuizVm);
            if (!success)
                return BadRequest(new { message = error });

            return Ok(new { message = "Start Quiz", userQuizId});
        }

        // Submit 
        [HttpPut("UserQuiz/{id}/submit")]
        public async Task<IActionResult> SubmitQuiz(Guid id, [FromBody] AddUserQuizVm startQuizVm)
        {
            var success = await _userQuizService.SubmitUserQuizAndCalculateScoreAsync(id, startQuizVm.Score);

            if (success)
            {
                return Ok(new { message = "Submit Successful" });
            }
            else
                return BadRequest(new { message = "Submit failed" });
        }

        [HttpPost("{userQuizId}/record")]
        public async Task<IActionResult> RecordAnswer(Guid userQuizId, [FromBody] AddUserAnswerVm recordAnswerVm)
        {
            bool result = await _userAnswerService.AddOrUpdateUserAnswerAsync(userQuizId, recordAnswerVm);
            if (result)
                return Ok(new { message = "Record Answer successful" });
            else
                return BadRequest(new { message = "Failed to record answer" });
        }


        [HttpGet("UserQuiz/{userQuizId}/detail")]
        public async Task<IActionResult> GetUserQuizDetail(Guid userQuizId)
        {
            var result = await _userQuizService.GetUserQuizDetailAsync(userQuizId);
            if (result == null)
                return NotFound(new { message = "Không tìm thấy lần làm bài này!" });
            return Ok(result);
        }

        [HttpGet("doing/{examId}/{userId}")]
        public async Task<IActionResult> GetDoingUserQuiz(Guid examId, Guid userId)
        {
            var result = await _userQuizService.GetDoingUserQuizAsync(examId, userId);
            if (result == null)
                return NotFound(new { message = "Không có bài thi đang làm hoặc đã hết giờ." });
            return Ok(result);
        }

    }
}
