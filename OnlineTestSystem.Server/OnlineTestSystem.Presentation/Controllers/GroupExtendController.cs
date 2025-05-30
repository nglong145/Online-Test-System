using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using OnlineTestSystem.BLL.Services.ExamService;
using OnlineTestSystem.BLL.Services.GroupService;
using OnlineTestSystem.BLL.ViewModels.Group;
using OnlineTestSystem.BLL.ViewModels.UserGroup;

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

        [HttpPost("filter-user-group")]
        public async Task<IActionResult> GetFilteredUserGroups([FromQuery] int pageIndex,
                                                   [FromQuery] int pageSize,
                                                   [FromBody] UserGroupFilterVm filterRequest,
                                                   [FromQuery] string sortBy = "CreatedAt",
                                                   [FromQuery] string sortOrder = "desc")
        {
            if (pageIndex <= 0 || pageSize <= 0)
            {
                return BadRequest(new { message = "PageIndex and PageSize must be greater than 0." });
            }

            try
            {
                var userGroups = await _userGroupService.FilterUserGroupsAsync(filterRequest, pageIndex, pageSize, sortBy, sortOrder);
                return Ok(userGroups);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }

        }

        // Add UserGroup
        [HttpPost("{groupId}/User/{userId}")]
        public async Task<IActionResult> AddUsertoGroup(Guid groupId,Guid userId)
        {
            try
            {
                var exists = await _userGroupService.ExistsAsync(groupId, userId);
                if (exists)
                {
                    return BadRequest(new { message = "Sinh viên đã thuộc nhóm này." });
                }

                var added = await _userGroupService.AddUserToGroupAsync(groupId, userId);
                if (!added)
                {
                    return BadRequest(new { message = "Không thể thêm sinh viên vào nhóm." });
                }

                return Ok(new { message = "Sinh viên đã được thêm vào nhóm." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // Delete UserGroup
        [HttpDelete("{groupId}/User/{userId}")]
        public async Task<IActionResult> RemoveUserFromGroup( Guid groupId,Guid userId)
        {
            var removed = await _userGroupService.RemoveUserFromGroupAsync(groupId,userId);

            if (!removed)
                return BadRequest(new { message = "Xóa thất bại." });

            return Ok(new { message = "Xóa sinh viên khỏi nhóm thành công." });
        }
    }
}
