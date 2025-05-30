using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using OnlineTestSystem.BLL.ViewModels;
using OnlineTestSystem.DAL.Models;

namespace OnlineTestSystem.Presentation.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EnumsController : ControllerBase
    {
        [HttpGet("question-types")]
        public IActionResult GetQuestionTypes()
        {
            var values = Enum.GetValues(typeof(QuestionType))
                .Cast<QuestionType>()
                .Select(e => new EnumItemVm
                {
                    Name = e.ToString(),
                    Value = (int)e
                }).ToList();

            return Ok(values);
        }

        [HttpGet("question-levels")]
        public IActionResult GetQuestionLevels()
        {
            var values = Enum.GetValues(typeof(QuestionLevel))
                .Cast<QuestionLevel>()
                .Select(e => new EnumItemVm
                {
                    Name = e.ToString(),
                    Value = (int)e
                }).ToList();

            return Ok(values);
        }
    }
}
