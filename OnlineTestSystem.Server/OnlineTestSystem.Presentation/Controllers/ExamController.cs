using Microsoft.AspNetCore.Mvc;
using OnlineTestSystem.BLL.Services.ExamService;
using OnlineTestSystem.BLL.ViewModels.Exam;
using OnlineTestSystem.BLL.ViewModels.ExamExtend;
using OnlineTestSystem.BLL.ViewModels.Group;
using OnlineTestSystem.DAL.Models;
using System.Runtime.Intrinsics.X86;

namespace OnlineTestSystem.Presentation.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ExamController : ControllerBase
    {
        private readonly IExamService _examService;

        public ExamController(IExamService examService)
        {
            _examService = examService;
        }

        [HttpGet("get-all-exam")]
        public async Task<IActionResult> GetAllExam()
        {
            var exams = await _examService.GetAllAsync();
            var examVm = new List<ExamVm>();
            foreach (var exam in exams)
            {
                examVm.Add(new ExamVm
                {
                    Id = exam.Id,
                    Name = exam.Name,
                    Description = exam.Description,
                    AccessCode = exam.AccessCode,
                    StartTime = exam.StartTime,
                    EndTime = exam.EndTime,
                    IsActive = exam.IsActive,
                });
            }
            return Ok(examVm);
        }

        [HttpGet("get-exam-by-id/{id}")]
        public async Task<IActionResult> GetExamById(Guid id)
        {
            var exam = await _examService.GetByIdAsync(id);
            if (exam != null)
            {
                var examVm = new ExamVm()
                {
                    Id = exam.Id,
                    Name = exam.Name,
                    Description = exam.Description,
                    AccessCode = exam.AccessCode,
                    StartTime = exam.StartTime,
                    EndTime = exam.EndTime,
                    IsActive = exam.IsActive,
                };
                return Ok(examVm);
            }
            return BadRequest("The exam does not exist!");
        }

        [HttpGet("Get-All-Exam-Pagination")]
        public async Task<IActionResult> GetAllExamPagination([FromQuery] int pageIndex, int pageSize)
        {
            if (pageIndex <= 0 || pageSize <= 0)
            {
                return BadRequest(new { message = "PageIndex and PageSize must be greater than 0." });
            }

            var exams = await _examService.GetExamListPaginationAsync(pageIndex, pageSize);
            return Ok(exams);

        }

        [HttpPost("add-new-exam")]
        public async Task<IActionResult> AddNewExam([FromBody] AddExamVm addExamVm)
        {
            var exam = new Exam()
            {
                Id = Guid.NewGuid(),
                Name = addExamVm.Name,
                Description = addExamVm.Description,
                AccessCode = addExamVm.AccessCode,
                StartTime = addExamVm.StartTime,
                EndTime = addExamVm.EndTime,
                IsActive = addExamVm.IsActive,
            };
            var result=await _examService.AddAsync(exam);
            if (result > 0)
            {
                return Ok(new { message = "Exam created successfully." });
            }
            return BadRequest(new { message = "Failed to created exam" });
        }

        [HttpPut("update-exam/{id}")]
        public async Task<IActionResult> UpdateExam(Guid id, [FromBody] AddExamVm addExamVm)
        {
            var exam = await _examService.GetByIdAsync(id);
            if (exam != null)
            {
                exam.Name=addExamVm.Name;
                exam.Description=addExamVm.Description;
                exam.AccessCode=addExamVm.AccessCode;
                exam.StartTime=addExamVm.StartTime;
                exam.EndTime=addExamVm.EndTime;
                exam.IsActive=addExamVm.IsActive;

                await _examService.UpdateAsync(exam);
                return Ok(exam);
            }
            return BadRequest("The exam does not exist!");
        }

        [HttpDelete("delete-exam/{id}")]
        public async Task<IActionResult> DeleteExam(Guid id)
        {
            var exam = await _examService.GetByIdAsync(id);
            if (exam != null)
            {
                await _examService.DeleteAsync(exam);
                return Ok("Delete Successful");
            }
            return BadRequest("Delete Faild!");
        }


        [HttpPost("filter")]
        public async Task<IActionResult> GetFilteredExams([FromQuery] int pageIndex,
                                                   [FromQuery] int pageSize,
                                                   [FromBody] FilterExamVm filterRequest,
                                                   [FromQuery] string sortBy = "StartTime",
                                                   [FromQuery] string sortOrder = "desc")
        {
            if (pageIndex <= 0 || pageSize <= 0)
            {
                return BadRequest(new { message = "PageIndex and PageSize must be greater than 0." });
            }

            try
            {
                var exams = await _examService.FilterExamsAsync(filterRequest, pageIndex, pageSize, sortBy, sortOrder);
                return Ok(exams);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }

        }
    }
}
