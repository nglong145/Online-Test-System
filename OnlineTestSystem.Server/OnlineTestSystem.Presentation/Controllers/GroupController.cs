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


        [HttpPost("filter-by-manager/{id}")]
        public async Task<IActionResult> GetGroupByManager(Guid id,[FromQuery] int pageIndex,
                                                  [FromQuery] int pageSize,
                                                  [FromBody] string? name)
        {
            if(pageIndex <= 0 || pageSize <= 0)
            {
                return BadRequest(new { message = "PageIndex and PageSize must be greater than 0." });
            }

            try
            {
                var groups = await _groupService.GetGroupByManagerAsync(id, pageIndex, pageSize,name);
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
            await _groupService.AddAsync(group);
            return Ok(group);
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

                await _groupService.UpdateAsync(group);
                return Ok(group);
            }
            return BadRequest("The group does not exist!");
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
