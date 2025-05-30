using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using OnlineTestSystem.BLL.Services.UserService;
using OnlineTestSystem.BLL.ViewModels.Group;
using OnlineTestSystem.BLL.ViewModels.User;

namespace OnlineTestSystem.Presentation.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        // API: Lấy tất cả người dùng
        [HttpGet("get-all-users")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _userService.GetAllUserAsync();
            return Ok(users);
        }

        [HttpPost("filter")]
        public async Task<IActionResult> GetFilteredUsers(
                                                  [FromQuery] string role,
                                                  [FromQuery] int pageIndex,
                                                  [FromQuery] int pageSize,
                                                  [FromBody] FilterUserVm filterRequest,
                                                  [FromQuery] string sortBy = "StudentCode",
                                                  [FromQuery] string sortOrder = "desc")
        {
            if (pageIndex <= 0 || pageSize <= 0)
            {
                return BadRequest(new { message = "PageIndex and PageSize must be greater than 0." });
            }

            try
            {
                var users = await _userService.FilterUsersAsync(role,filterRequest, pageIndex, pageSize, sortBy, sortOrder);
                return Ok(users);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }

        }

        // API: Lấy thông tin người dùng theo ID
        [HttpGet("get-user/{id}")]
        public async Task<IActionResult> GetUser(Guid id)
        {
            try
            {
                var user = await _userService.GetUserInfoAsync(id);
                if (user != null)
                {
                    return Ok(user);
                }
                return NotFound("User not found.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        // API: Thêm người dùng mới
        [HttpPost("add-new-user")]
        public async Task<IActionResult> AddUser([FromBody] CreateUserVm createUserVm)
        {
            try
            {
                var isUserCreated = await _userService.AddUserAsync(createUserVm);
                if (isUserCreated)
                {
                    return Ok(new { message = "User created successfully." });
                }
                return BadRequest(new { message = "Failed to create user." });
            }
            catch (Exception ex)
            {
                // Nếu là lỗi email đã tồn tại
                if (ex.Message.Contains("already exists"))
                    return BadRequest(new { message = ex.Message });
                // Lỗi khác
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        // API: Cập nhật thông tin người dùng
        [HttpPut("update-user/{id}")]
        public async Task<IActionResult> UpdateUser(Guid id, [FromBody] UpdateUserVm updateUserVm)
        {
            try
            {
                var isUpdated = await _userService.UpdateUserInfoAsync(id, updateUserVm);
                if (isUpdated)
                {
                    return Ok(new { message = "User updated successfully." });
                }
                return BadRequest(new { message = "Failed to update user." });
            }
            catch (Exception ex)
            {
                // Nếu là lỗi email đã tồn tại
                if (ex.Message.Contains("already exists"))
                    return BadRequest(new { message = ex.Message });
                // Lỗi khác
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        // API: Xóa người dùng
        [HttpDelete("delete-user/{id}")]
        public async Task<IActionResult> DeleteUser(Guid id)
        {
            var result = await _userService.DeleteAsync(id);
            if (result > 0)
            {
                return Ok("User deleted successfully.");
            }
            return BadRequest("User deletion failed.");
        }

        [HttpGet("get-users-by-role/{roleName}")]
        public async Task<IActionResult> GetUsersByRole(string roleName)
        {
            try
            {
                var users = await _userService.GetUsersByRoleNameAsync(roleName);
                return Ok(users);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordVm vm)
        {
            try
            {
                var result = await _userService.ChangePasswordAsync(vm);
                if (result)
                    return Ok(new { message = "Đổi mật khẩu thành công!" });
                return BadRequest(new { message = "Đổi mật khẩu thất bại." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }


    }
}
