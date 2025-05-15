using OnlineTestSystem.BLL.Services.Base;
using OnlineTestSystem.BLL.ViewModels;
using OnlineTestSystem.BLL.ViewModels.Exam;
using OnlineTestSystem.BLL.ViewModels.ExamExtend;
using OnlineTestSystem.BLL.ViewModels.Group;
using OnlineTestSystem.BLL.ViewModels.User;
using OnlineTestSystem.DAL.Models;

namespace OnlineTestSystem.BLL.Services.GroupService
{
    // Group
    public interface IGroupService : IBaseService<Group>
    {
        Task<GroupVm> GetGroupByIdAsync(Guid groupId);
        Task<PaginatedResult<GroupVm>> GetGroupByManagerAsync(Guid manager, int pageIndex,
                                                              int pageSize, string filterName);
        Task<PaginatedResult<GroupVm>> FilterGroupsAsync(FilterGroupVm filterRequest,
                                                              int pageIndex,
                                                              int pageSize,
                                                              string sortBy,
                                                              string sortOrder);
    }

    // UserGroup
    public interface IUserGroupService : IBaseService<UserGroup>
    {
        Task<PaginatedResult<UserVm>> GetUsersByGroupIdAsync(Guid groupId, int pageIndex, int pageSize);
        Task<bool> AddUserToGroupAsync(Guid groupId, Guid userId);
        Task<bool> RemoveUserFromGroupAsync(Guid groupId, Guid userId);
    }
}
