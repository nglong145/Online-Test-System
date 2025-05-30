using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using OnlineTestSystem.BLL.Services.GroupService;
using OnlineTestSystem.BLL.ViewModels.Group;
using OnlineTestSystem.BLL.ViewModels.User;
using OnlineTestSystem.DAL.Models;
using System.Data;
using System.Globalization;

namespace OnlineTestSystem.Presentation.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GroupController : ControllerBase
    {
        private readonly IGroupService _groupService;

        public GroupController(IGroupService groupService)
        {
            _groupService = groupService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllGroup()
        {
            var groups = await _groupService.GetAllAsync();
            var groupsVm = new List<GroupVm>();
            foreach (var group in groups)
            {
                groupsVm.Add(new GroupVm
                {
                    Id = group.Id,
                    Name = group.Name,
                    Description = group.Description,
                    CreatedAt = group.CreatedAt,
                    IsActive = group.IsActive,
                    UserManager = group.UserManager,
                });
            }
            return Ok(groupsVm);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetGroupById(Guid id)
        {
            try
            {
                var group = await _groupService.GetGroupByIdAsync(id);
                return Ok(group);
            }
            catch (Exception ex)
            {
                return NotFound(ex.Message);
            }
        }


        [HttpPost("filter-by-manager")]
        public async Task<IActionResult> GetGroupByManager([FromQuery] int pageIndex,
                                                   [FromQuery] int pageSize,
                                                   [FromBody] FilterGroupVm filterRequest,
                                                   [FromQuery] string sortBy = "name",
                                                   [FromQuery] string sortOrder = "desc")
        {
            if(pageIndex <= 0 || pageSize <= 0)
            {
                return BadRequest(new { message = "PageIndex and PageSize must be greater than 0." });
            }

            try
            {
                var groups = await _groupService.GetGroupByManagerAsync(filterRequest, pageIndex, pageSize, sortBy, sortOrder);
                return Ok(groups);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpPost("filter")]
        public async Task<IActionResult> GetFilteredGroups([FromQuery] int pageIndex,
                                                   [FromQuery] int pageSize,
                                                   [FromBody] FilterGroupVm filterRequest,
                                                   [FromQuery] string sortBy = "CreatedAt",
                                                   [FromQuery] string sortOrder = "desc")
        {
            if (pageIndex <= 0 || pageSize <= 0)
            {
                return BadRequest(new { message = "PageIndex and PageSize must be greater than 0." });
            }

            try
            {
                var groups = await _groupService.FilterGroupsAsync(filterRequest, pageIndex, pageSize, sortBy, sortOrder);
                return Ok(groups);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }

        }

        [HttpPost]
        public async Task<IActionResult> AddNewGroup([FromBody] AddGroupVm addGroupVm)
        {
            var group = new Group()
            {
                Id = Guid.NewGuid(),
                Name = addGroupVm.Name,
                Description = addGroupVm.Description,
                IsActive = addGroupVm.IsActive,
                UserManager = addGroupVm.UserManager,
            };
            var result = await _groupService.AddAsync(group);
            if (result > 0)
            {
                return Ok(new { message = "Group created successfully." });
            }
            return BadRequest(new { message = "Failed to created group" });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateGroup(Guid id, [FromBody] AddGroupVm addGroupVm)
        {
            var group = await _groupService.GetByIdAsync(id);
            if (group != null)
            {
                group.Name = addGroupVm.Name;
                group.Description = addGroupVm.Description;
                group.IsActive = addGroupVm.IsActive;
                group.UserManager = addGroupVm.UserManager;

                var result = await _groupService.UpdateAsync(group);
                if (result > 0)
                {
                    return Ok(new { message = "Group updated successfully." });
                }
                return BadRequest(new { message = "Failed to updated group" });
            }
            return NotFound(new { message = "The group does not exist!" });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteGroup(Guid id)
        {
            var group = await _groupService.GetByIdAsync(id);
            if (group != null)
            {
                await _groupService.DeleteAsync(group);
                return Ok("Delete Successful");
            }
            return BadRequest("Delete Faild!");
        }
    }
}
