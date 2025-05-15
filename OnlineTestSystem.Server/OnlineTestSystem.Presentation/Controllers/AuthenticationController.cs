using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OnlineTestSystem.BLL.Services.AuthenticationService;
using OnlineTestSystem.BLL.ViewModels.Auth;
using System.Security.Claims;

namespace OnlineTestSystem.Presentation.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthenticationController : ControllerBase
    {
        private readonly IAuthenticationService _authenticationService;
        //private readonly IImageService _imageService;
        //private readonly IWebHostEnvironment _webHostEnvironment;

        public AuthenticationController(IAuthenticationService authenticationService)
        {
            _authenticationService = authenticationService;
            //_imageService = imageService;
            //_webHostEnvironment = webHostEnvironment;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterVm registerVm)
        {
            try
            {
                var result = await _authenticationService.RegisterUserAsync(registerVm);
                return Created(nameof(Register), result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginVm loginVm)
        {
            try
            {
                var result = await _authenticationService.LoginUserAsync(loginVm);
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { Message = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [Authorize]
        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken([FromBody] string refreshToken)
        {
            try
            {
                var result = await _authenticationService.RefreshTokenAsync(refreshToken);
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { Message = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [Authorize]
        [HttpGet("user-info")]
        public async Task<IActionResult> GetUserInfo()
        {
            try
            {
                var userId = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { Message = "User is not authenticated." });
                }

                var userInfo = await _authenticationService.GetUserInfoAsync(Guid.Parse(userId));
                return Ok(userInfo);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        //[Authorize]
        //[HttpPut("update-user-info")]
        //public async Task<IActionResult> UpdateUserInfo([FromBody] UpdateUserVm updateUserVm)
        //{
        //    try
        //    {
        //        var userId = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;
        //        if (string.IsNullOrEmpty(userId))
        //        {
        //            return Unauthorized(new { Message = "User is not authenticated." });
        //        }

        //        var isUpdated = await _authenticationService.UpdateUserInfoAsync(Guid.Parse(userId), updateUserVm);
        //        if (!isUpdated)
        //        {
        //            return BadRequest(new { Message = "Failed to update user information." });
        //        }

        //        return Ok(new { Message = "User information updated successfully." });
        //    }
        //    catch (Exception ex)
        //    {
        //        return BadRequest(new { Message = ex.Message });
        //    }
        //}

        //[Authorize]
        //[HttpPut("Change-Password")]
        //public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordVm passwordVm)
        //{
        //    try
        //    {
        //        var userId = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;
        //        if (string.IsNullOrEmpty(userId))
        //        {
        //            return Unauthorized(new { Message = "User is not authenticated." });
        //        }

        //        var isUpdated = await _authenticationService.ChangePasswordAsync(Guid.Parse(userId), passwordVm);
        //        if (!isUpdated)
        //        {
        //            return BadRequest(new { Message = "Failed to update user information." });
        //        }

        //        return Ok(new { Message = "User information updated successfully." });
        //    }
        //    catch (Exception ex)
        //    {
        //        return BadRequest(new { Message = ex.Message });
        //    }
        //}
    }
}
