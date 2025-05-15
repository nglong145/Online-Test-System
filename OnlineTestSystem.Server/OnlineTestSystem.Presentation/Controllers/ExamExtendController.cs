using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using OnlineTestSystem.BLL.Services.ExamService;
using OnlineTestSystem.BLL.ViewModels.ExamExtend;
using OnlineTestSystem.BLL.ViewModels.ExamQuiz;
using OnlineTestSystem.BLL.ViewModels.Group;

namespace OnlineTestSystem.Presentation.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ExamExtendController : ControllerBase
    {
        private readonly IExamGroupService _examGroupService;
        private readonly IExamParticipantService _examParticipantService;
        private readonly IExamQuizService _examQuizService;

        public ExamExtendController(IExamGroupService examGroupService, IExamParticipantService examParticipantService, IExamQuizService examQuizService)
        {
            _examGroupService = examGroupService;
            _examParticipantService = examParticipantService;
            _examQuizService = examQuizService;
        }

        // Add ExamGroup
        [HttpPost("{examId}/Group/{groupId}")]
        public async Task<IActionResult> AddGrouptoExam(Guid examId, Guid groupId)
        {
            var added = await _examGroupService.AddGroupToExamAsync(examId, groupId);
            if (!added)
                return BadRequest("Nhóm đã tồn tại trong kỳ thi.");

            return Ok("Đã thêm nhóm vào kỳ thi thành công.");
        }

        // Delete ExamGroup
        [HttpDelete("{examId}/groups/{groupId}")]
        public async Task<IActionResult> RemoveGroupFromExam(Guid examId, Guid groupId)
        {
            var removed = await _examGroupService.RemoveGroupFromExamAsync(examId, groupId);

            if (!removed)
                return BadRequest("Nhóm không tồn tại trong kỳ thi hoặc đã bị xóa.");

            return Ok("Đã xóa nhóm khỏi kỳ thi thành công.");
        }

        // Add ExamParticipant
        [HttpPost("{examId}/User/{userId}")]
        public async Task<IActionResult> AddUserToExam(Guid examId, Guid userId, [FromBody] AddUserToExamVm vm)
        {
            if (vm == null || userId == Guid.Empty)
                return BadRequest("UserId không hợp lệ.");

            var input = new AddUserToExamVm()
            {
                Status = vm.Status,
                Note = vm.Note,
            };

            var added = await _examParticipantService.AddUserToExamAsync(examId, userId, input);

            if (!added)
                return BadRequest("Người dùng đã được thêm vào kỳ thi trước đó.");

            return Ok("Đã thêm người dùng vào kỳ thi thành công.");
        }

        // Delete ExamParticipant
        [HttpDelete("{examId}/User/{userId}")]
        public async Task<IActionResult> RemoveUserFromExam(Guid examId, Guid userId)
        {
            var removed = await _examParticipantService.RemoveUserFromExamAsync(examId, userId);
            if (!removed)
                return NotFound("Người dùng không tồn tại trong kỳ thi.");

            return Ok("Đã xoá người dùng khỏi kỳ thi.");
        }


        [HttpPost("filter-exam-quiz")]
        public async Task<IActionResult> GetFilteredExamQuizzes([FromQuery] int pageIndex,
                                                   [FromQuery] int pageSize,
                                                   [FromBody] FilterExamQuizVm filterRequest)
        {
            if (pageIndex <= 0 || pageSize <= 0)
            {
                return BadRequest(new { message = "PageIndex and PageSize must be greater than 0." });
            }

            try
            {
                var examQuizzes = await _examQuizService.FilterExamQuizzesAsync(filterRequest, pageIndex, pageSize);
                return Ok(examQuizzes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }

        }

        // Add ExamQuiz
        [HttpPost("{examId}/Quiz/{quizId}")]
        public async Task<IActionResult> AddQuizToExam(Guid examId, Guid quizId, [FromBody] AddQuizToExamVm vm)
        {
            if (vm == null || quizId == Guid.Empty)
                return BadRequest("UserId không hợp lệ.");

            var input = new AddQuizToExamVm()
            {
                Order = vm.Order,
            };

            var added = await _examQuizService.AddQuizToExamAsync(examId, quizId, input);

            if (!added)
                return BadRequest("Quiz đã được thêm vào kỳ thi trước đó.");

            return Ok("Đã thêm Quiz vào kỳ thi thành công.");
        }

        // Delete ExamQuiz
        [HttpDelete("{examId}/quizzes/{quizId}")]
        public async Task<IActionResult> RemoveQuizFromExam(Guid examId, Guid quizId)
        {
            var removed = await _examQuizService.RemoveQuizFromExamAsync(examId, quizId);

            if (!removed)
                return BadRequest("Đề thi không tồn tại trong kỳ thi hoặc đã bị xóa.");

            return Ok("Đã xóa đề thi khỏi kỳ thi thành công.");
        }
    }
}
