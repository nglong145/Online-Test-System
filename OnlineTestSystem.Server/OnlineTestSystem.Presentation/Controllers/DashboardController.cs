using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using OnlineTestSystem.BLL.Services.Dashboard;
using OnlineTestSystem.BLL.ViewModels.Dashboard;

namespace OnlineTestSystem.Presentation.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardService _dashboardService;

        public DashboardController(IDashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary()
        {
            var summary = await _dashboardService.GetSummaryAsync();
            return Ok(summary);
        }

        [HttpPost("exam-average-scores")]
        public async Task<IActionResult> GetExamAverageScores([FromBody] FilterDashboardScore filter)
        {
            var result = await _dashboardService.GetExamAverageScoresAsync(filter);
            return Ok(result);
        }


    }

}
