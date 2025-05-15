using Microsoft.AspNetCore.Mvc;
using OnlineTestSystem.BLL.Services.QuestionBankService;
using OnlineTestSystem.BLL.ViewModels.QuestionBank;
using OnlineTestSystem.BLL.ViewModels.QuizCategory;
using OnlineTestSystem.DAL.Models;
using System.Security.Claims;

namespace OnlineTestSystem.Presentation.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class QuestionBankController : ControllerBase
    {
        private readonly IQuestionBankService _bankService;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public QuestionBankController(IQuestionBankService bankService, IHttpContextAccessor httpContextAccessor)
        {
            _bankService = bankService;
            _httpContextAccessor = httpContextAccessor;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllQuestionBank()
        {
            var banks = await _bankService.GetAllAsync();
            var bankVm = new List<QuestionBankVm>();
            foreach (var bank in banks)
            {
                bankVm.Add(new QuestionBankVm
                {
                    Id = bank.Id,
                    Name = bank.Name,
                    OwnerId = bank.OwnerId,
                    QuizCategoryId = bank.QuizCategoryId
                });
            }
            return Ok(bankVm);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetQuestionBankById(Guid id)
        {
            var bank = await _bankService.GetByIdAsync(id);
            if (bank != null)
            {
                var bankVm = new QuestionBankVm()
                {
                    Id = bank.Id,
                    Name = bank.Name,
                    OwnerId = bank.OwnerId,
                    //OwnerFullName=bank.Owner.LastName+bank.Owner.FirstName,
                    QuizCategoryId = bank.QuizCategoryId,
                    //CategoryName=bank.QuizCategory.Name,
                    //TotalQuestion=bank.Questions.Count,
                };
                return Ok(bankVm);
            }
            return BadRequest("The question bank does not exist!");
        }


        [HttpPost("Filter")]
        public async Task<IActionResult> FilteQuestionBank([FromQuery] int pageIndex, int pageSize,
                                                   [FromBody] FilterBankVm filterRequest,
                                                   [FromQuery] string sortBy = "Name", string sortOrder = "desc")
        {
            if (pageIndex <= 0 || pageSize <= 0)
            {
                return BadRequest(new { message = "PageIndex and PageSize must be greater than 0." });
            }

            try
            {
                var banks = await _bankService.FilterBanksAsync(filterRequest, pageIndex, pageSize, sortBy, sortOrder);
                return Ok(banks);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }

        }


        [HttpPost]
        public async Task<IActionResult> AddNewQuestionBank([FromBody] AddQuestionBankVm addBankVm)
        {
            var bank = new QuestionBank()
            {

                Name = addBankVm.Name,
                OwnerId = addBankVm.OwnerId,
                QuizCategoryId = addBankVm.QuizCategoryId,
            };
            var result = await _bankService.AddAsync(bank);
            if (result > 0)
            {
                return Ok(new { message = "Bank created successfully." });
            }
            return BadRequest(new { message = "Failed to created bank" });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateQuestionBank(Guid id, [FromBody] AddQuestionBankVm addBankVm)
        {
            var bank = await _bankService.GetByIdAsync(id);
            if (bank != null)
            {
                bank.Name = addBankVm.Name;
                bank.OwnerId = addBankVm.OwnerId;
                bank.QuizCategoryId = addBankVm.QuizCategoryId;

                var result = await _bankService.UpdateAsync(bank);
                if (result > 0)
                {
                    return Ok(new { message = "Bank updated successfully." });
                }
                return BadRequest(new { message = "Failed to updated bank" });
            }
            return NotFound(new { message = "The bank does not exist!" });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteQuestionBank(Guid id)
        {
            var bank = await _bankService.GetByIdAsync(id);
            if (bank != null)
            {
                await _bankService.DeleteAsync(bank);
                return Ok("Delete Successful");
            }
            return BadRequest("Delete Faild!");
        }



        // Upload file create Bank
        [HttpPost("upload-create-bank")]
        public async Task<IActionResult> UploadFile( IFormFile file, [FromForm] string name, [FromForm] Guid ownerId, [FromForm] Guid? quizCategoryId)
        {
            if (file == null || file.Length == 0)
                return BadRequest("File không được để trống.");

            var bankVm = new AddQuestionBankVm
            {
                Name = name,
                OwnerId = ownerId,
                QuizCategoryId = quizCategoryId
            };

            using var stream = file.OpenReadStream();

            try
            {
                var questionBankId = await _bankService.ImportFromFileAsync(stream, file.FileName,bankVm);
                return Ok(new { QuestionBankId = questionBankId, Message = "Upload câu hỏi thành công." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
        }
    }
}
