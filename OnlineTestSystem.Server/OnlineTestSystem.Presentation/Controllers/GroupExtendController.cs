using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using OnlineTestSystem.BLL.Services.ExamService;
using OnlineTestSystem.BLL.Services.GroupService;

namespace OnlineTestSystem.Presentation.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GroupExtendController : ControllerBase
    {
        private readonly IUserGroupService _userGroupService;

        public GroupExtendController(IUserGroupService userGroupService)
        {
            _userGroupService = userGroupService;
        }

        [HttpGet("{groupId}/users")]
        public async Task<IActionResult> GetUsersByGroup(Guid groupId, int pageIndex = 1, int pageSize = 10)
        {
            var result = await _userGroupService.GetUsersByGroupIdAsync(groupId, pageIndex, pageSize);

            if (result.Items.Any())
            {
                return Ok(result);
            }
            return NotFound("No users found for this group.");
        }

        // Add UserGroup
        [HttpPost("{groupId}/User/{userId}")]
        public async Task<IActionResult> AddUsertoGroup(Guid userId, Guid groupId)
        {
            var added = await _userGroupService.AddUserToGroupAsync(userId, groupId);
            if (!added)
                return BadRequest("Thất bại");

            return Ok("sinh viên đã được thêm vào nhóm.");
        }

        // Delete UserGroup
        [HttpDelete("{groupId}/User/{userId}")]
        public async Task<IActionResult> RemoveUserFromGroup(Guid userId, Guid groupId)
        {
            var removed = await _userGroupService.RemoveUserFromGroupAsync(userId, groupId);

            if (!removed)
                return BadRequest("Failed.");

            return Ok("Đã xóa sinh viên khỏi nhóm.");
        }
    }
}
