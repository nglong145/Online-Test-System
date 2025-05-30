using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using OfficeOpenXml.Packaging.Ionic.Zlib;
using OnlineTestSystem.BLL.Services.ExamService;
using OnlineTestSystem.BLL.ViewModels.Exam;
using OnlineTestSystem.BLL.ViewModels.ExamExtend;
using OnlineTestSystem.BLL.ViewModels.ExamParticipant;
using OnlineTestSystem.BLL.ViewModels.ExamQuiz;
using OnlineTestSystem.BLL.ViewModels.Group;
using OnlineTestSystem.DAL.Models;

namespace OnlineTestSystem.Presentation.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ExamExtendController : ControllerBase
    {
        private readonly IExamService _examService;
        private readonly IExamGroupService _examGroupService;
        private readonly IExamParticipantService _examParticipantService;
        private readonly IExamQuizService _examQuizService;


        public ExamExtendController( IExamGroupService examGroupService, IExamParticipantService examParticipantService, IExamQuizService examQuizService, IExamService examService)
        {
            _examGroupService = examGroupService;
            _examParticipantService = examParticipantService;
            _examQuizService = examQuizService;
            _examService = examService;
        }

        // filter ExamGroup
        [HttpPost("filter-exam-group")]
        public async Task<IActionResult> GetFilteredExamGroups([FromQuery] int pageIndex,
                                                   [FromQuery] int pageSize,
                                                   [FromBody] FilterExamGroupVm filterRequest,
                                                   [FromQuery] string sortBy = "groupId",
                                                   [FromQuery] string sortOrder = "desc")
        {
            if (pageIndex <= 0 || pageSize <= 0)
            {
                return BadRequest(new { message = "PageIndex and PageSize must be greater than 0." });
            }

            try
            {
                var examGroups = await _examGroupService.FilterExamGroupsAsync(filterRequest, pageIndex, pageSize, sortBy, sortOrder);
                return Ok(examGroups);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }

        }

        // Add ExamGroup
        [HttpPost("{examId}/Group/{groupId}")]
        public async Task<IActionResult> AddGrouptoExam(Guid examId, Guid groupId)
        {
            try
            {
                var exists = await _examGroupService.ExamGroupExistsAsync(examId, groupId);
                if (exists)
                {
                    return BadRequest(new { message = "Nhóm đã tồn tại trong kỳ thi này." });
                }

                var added = await _examGroupService.AddGroupToExamAsync(examId, groupId);
                if (!added)
                {
                    return BadRequest(new { message = "Không thể thêm nhóm vào kỳ thi." });
                }

                return Ok(new { message = "Nhóm đã được thêm vào kỳ thi." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // Delete ExamGroup
        [HttpDelete("{examId}/Group/{groupId}")]
        public async Task<IActionResult> RemoveGroupFromExam(Guid examId, Guid groupId)
        {
            var removed = await _examGroupService.RemoveGroupFromExamAsync(examId, groupId);

            if (!removed)
                return BadRequest(new { message = "Xóa thất bại." });


            return Ok(new { message = "Đã xoá nhóm khỏi kỳ thi." });
        }

        // --------- //
        // filter ExamUser
        [HttpPost("filter-exam-user")]
        public async Task<IActionResult> GetFilteredExamUsers([FromQuery] int pageIndex,
                                                   [FromQuery] int pageSize,
                                                   [FromBody] FilterExamUserVm filterRequest,
                                                   [FromQuery] string sortBy = "userId",
                                                   [FromQuery] string sortOrder = "desc")
        {
            if (pageIndex <= 0 || pageSize <= 0)
            {
                return BadRequest(new { message = "PageIndex and PageSize must be greater than 0." });
            }

            try
            {
                var examUsers = await _examParticipantService.FilterExamUsersAsync(filterRequest, pageIndex, pageSize, sortBy, sortOrder);
                return Ok(examUsers);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }

        }

        // filter Exam upcoming
        [HttpPost("filter-upcoming-exam")]
        public async Task<IActionResult> GetFilteredUpcomingExams([FromQuery] int pageIndex,
                                                  [FromQuery] int pageSize,
                                                  [FromBody] FilterExamUserVm filterRequest,
                                                  [FromQuery] string sortBy = "createdAt",
                                                  [FromQuery] string sortOrder = "desc")
        {
            if (pageIndex <= 0 || pageSize <= 0)
            {
                return BadRequest(new { message = "PageIndex and PageSize must be greater than 0." });
            }

            try
            {
                var examUsers = await _examParticipantService.FilterUpcomingExamsAsync(filterRequest, pageIndex, pageSize, sortBy, sortOrder);
                return Ok(examUsers);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }

        }

        // filter Exam oncoming
        [HttpPost("filter-oncoming-exam")]
        public async Task<IActionResult> GetFilteredOncomingExams([FromQuery] int pageIndex,
                                                  [FromQuery] int pageSize,
                                                  [FromBody] FilterExamUserVm filterRequest,
                                                  [FromQuery] string sortBy = "createdAt",
                                                  [FromQuery] string sortOrder = "desc")
        {
            if (pageIndex <= 0 || pageSize <= 0)
            {
                return BadRequest(new { message = "PageIndex and PageSize must be greater than 0." });
            }

            try
            {
                var examUsers = await _examParticipantService.FilterOncomingExamsAsync(filterRequest, pageIndex, pageSize, sortBy, sortOrder);
                return Ok(examUsers);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }

        }


        [HttpGet("export-exam-participants/{examId}")]
        public async Task<IActionResult> ExportExamParticipants(Guid examId)
        {
            var fileBytes = await _examParticipantService.ExportExamParticipantListToExcelAsync(examId);
            var exam = await _examService.GetByIdAsync(examId);
            var fileName = $"danhsachduthi_{exam?.Name ?? "exam"}.xlsx";
            return File(fileBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
        }

        // Add ExamParticipant
        [HttpPost("{examId}/User/{userId}")]
        public async Task<IActionResult> AddUserToExam(Guid examId, Guid userId, [FromBody] AddUserToExamVm vm)
        {
            var input = new AddUserToExamVm()
            {
                Status = vm.Status,
                Note = vm.Note,
            };


            try
            {
                var exists = await _examParticipantService.ExamUserExistsAsync(examId, userId);
                if (exists)
                {
                    return BadRequest(new { message = "Thành viên đã tồn tại trong nhóm này." });
                }

                var added = await _examParticipantService.AddUserToExamAsync(examId, userId, input);
                if (!added)
                {
                    return BadRequest(new { message = "Không thể thêm thành viên vào kỳ thi." });
                }

                return Ok(new { message = "Thành viên đã được thêm vào kỳ thi." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }



        // Delete ExamParticipant
        [HttpDelete("{examId}/User/{userId}")]
        public async Task<IActionResult> RemoveUserFromExam(Guid examId, Guid userId)
        {
            var removed = await _examParticipantService.RemoveUserFromExamAsync(examId, userId);
            if (!removed)
                return BadRequest(new { message = "Xóa thất bại." });

        
            return Ok(new { message = "Đã xoá người dùng khỏi kỳ thi." });
        }


        // --------- //
        // filter ExamQuiz
        [HttpPost("filter-exam-quiz")]
        public async Task<IActionResult> GetFilteredExamQuizzes([FromQuery] int pageIndex,
                                                   [FromQuery] int pageSize,
                                                   [FromBody] FilterExamQuizVm filterRequest,[FromQuery] string sortBy = "examId",
                                                   [FromQuery] string sortOrder = "desc")
        {
            if (pageIndex <= 0 || pageSize <= 0)
            {
                return BadRequest(new { message = "PageIndex and PageSize must be greater than 0." });
            }

            try
            {
                var examQuizzes = await _examQuizService.FilterExamQuizzesAsync(filterRequest, pageIndex, pageSize, sortBy,sortOrder);
                return Ok(examQuizzes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }

        }

        // Add ExamQuiz
        [HttpPost("{examId}/Quiz/{quizId}")]
        public async Task<IActionResult> AddQuizToExam(Guid examId, Guid quizId)
        {
            try
            {
                var exists = await _examQuizService.ExamQuizExistsAsync(examId, quizId);
                if (exists)
                {
                    return BadRequest(new { message = "Đề thi đã được thêm vào kỳ thi" });
                }

                var added = await _examQuizService.AddQuizToExamAsync(examId, quizId);
                if (!added)
                {
                    return BadRequest(new { message = "Không thể thêm đề thi vào kỳ thi." });
                }

                return Ok(new { message = "Đã thêm đề thi vào kỳ thi thành công." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }


        }

        // Delete ExamQuiz
        [HttpDelete("{examId}/Quiz/{quizId}")]
        public async Task<IActionResult> RemoveQuizFromExam(Guid examId, Guid quizId)
        {
            var removed = await _examQuizService.RemoveQuizFromExamAsync(examId, quizId);

            if (!removed)
                return BadRequest(new { message = "Xóa thất bại." });


            return Ok(new { message = "Đã xóa đề thi khỏi kỳ thi thành công." });
        }


        [HttpGet("{examId}/random-quiz")]
        public async Task<IActionResult> GetRandomQuizForExam(Guid examId)
        {
            var quiz = await _examQuizService.GetRandomQuizForExamAsync(examId);

            if (quiz == null)
                return NotFound(new { message = "Không tìm thấy đề thi." });

            return Ok(quiz);
        }
    }
}
