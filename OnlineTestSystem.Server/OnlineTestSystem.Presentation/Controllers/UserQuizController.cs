using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using OnlineTestSystem.BLL.Services.DoQuizService;
using OnlineTestSystem.BLL.Services.ExamService;
using OnlineTestSystem.BLL.Services.GroupService;
using OnlineTestSystem.BLL.Services.UserService;
using OnlineTestSystem.BLL.ViewModels.UserQuiz;

namespace OnlineTestSystem.Presentation.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserQuizController : ControllerBase
    {
        private readonly IDoQuizService _userQuizService;
        private readonly IDoQuizService _doQuizService;
        private readonly IExamService _examService;
        private readonly IUserService _userService;

        public UserQuizController(IDoQuizService userQuizService, IDoQuizService doQuizService, IExamService examService, IUserService userService)
        {
            _userQuizService = userQuizService;
            _doQuizService = doQuizService;
            _examService = examService;
            _userService = userService;
        }

        [HttpPost("filter")]
        public async Task<IActionResult> GetFilteredUserQuizzes([FromQuery] int pageIndex,
                                                   [FromQuery] int pageSize,
                                                   [FromBody] FilterUserQuizVm filterRequest,
                                                   [FromQuery] string sortBy = "StartedAt",
                                                   [FromQuery] string sortOrder = "desc")
        {
            if (pageIndex <= 0 || pageSize <= 0)
            {
                return BadRequest(new { message = "PageIndex and PageSize must be greater than 0." });
            }

            try
            {
                var userQuizzes = await _userQuizService.FilterUserQuizzesAsync(filterRequest,pageIndex, pageSize, sortBy, sortOrder);
                return Ok(userQuizzes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }


        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUserQuiz(Guid id)
        {
            try
            {

                var userQuiz = await _userQuizService.GetByIdAsync(id);
                if (userQuiz != null)
                {
                    await _userQuizService.DeleteAsync(userQuiz);
                    return Ok(new { message = "Cancel quiz successfully." });
                }
                return BadRequest(new { message = "Cancel quiz faild!" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }


        [HttpGet("export-user-quiz/{examId}")]
        public async Task<IActionResult> ExportUserQuizzes(Guid examId)
        {
            try
            {

            var fileBytes = await _doQuizService.ExportUserQuizToExcelAsync(examId);
            var exam = await _examService.GetByIdAsync(examId);
            var fileName = $"bangdiem_{exam?.Name ?? "exam"}.xlsx";
            return File(fileBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpGet("export-user-quiz/{examId}/User/{userId}")]
        public async Task<IActionResult> ExportUserQuizzesByUserId(Guid examId,Guid userId)
        {
            try
            {

                var fileBytes = await _doQuizService.ExportUserQuizByUserToExcelAsync(examId, userId);
                var exam = await _examService.GetByIdAsync(examId);
                var user = await _userQuizService.GetUserQuizDetailAsync(userId);
                var fileName = $"bangdiemsinhvien_{exam?.Name ?? "exam"}_{user?.StudentCode ?? "maSV"}.xlsx";
                return File(fileBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
            }
            catch (Exception ex)
            { return StatusCode(500, new { message = "Internal server error", error = ex.Message }); }
        }
    }
}
