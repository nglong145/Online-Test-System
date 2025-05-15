using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using OnlineTestSystem.BLL.Services.DoQuizService;
using OnlineTestSystem.BLL.Services.GroupService;
using OnlineTestSystem.BLL.ViewModels.UserQuiz;

namespace OnlineTestSystem.Presentation.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserQuizController : ControllerBase
    {
        private readonly IUserQuizService _userQuizService;

        public UserQuizController(IUserQuizService userQuizService)
        {
            _userQuizService = userQuizService;
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
    }
}
