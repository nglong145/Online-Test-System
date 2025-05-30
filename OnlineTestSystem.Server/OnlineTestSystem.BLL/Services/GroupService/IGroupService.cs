using OnlineTestSystem.BLL.Services.Base;
using OnlineTestSystem.BLL.ViewModels;
using OnlineTestSystem.BLL.ViewModels.Group;
using OnlineTestSystem.BLL.ViewModels.User;
using OnlineTestSystem.BLL.ViewModels.UserGroup;
using OnlineTestSystem.DAL.Models;

namespace OnlineTestSystem.BLL.Services.GroupService
{
    // Group
    public interface IGroupService : IBaseService<Group>
    {
        Task<GroupVm> GetGroupByIdAsync(Guid groupId);
        Task<PaginatedResult<GroupVm>> GetGroupByManagerAsync(FilterGroupVm filterRequest,
                                                              int pageIndex,
                                                              int pageSize,
                                                              string sortBy,
                                                              string sortOrder);
        Task<PaginatedResult<GroupVm>> FilterGroupsAsync(FilterGroupVm filterRequest,
                                                              int pageIndex,
                                                              int pageSize,
                                                              string sortBy,
                                                              string sortOrder);

    }

    // UserGroup
    public interface IUserGroupService : IBaseService<UserGroup>
    {
        Task<PaginatedResult<UserGroupVm>> FilterUserGroupsAsync(UserGroupFilterVm filterRequest,
                                                              int pageIndex,
                                                              int pageSize,
                                                              string sortBy,
                                                              string sortOrder);


        Task<bool> ExistsAsync(Guid groupId, Guid userId);
        Task<bool> AddUserToGroupAsync(Guid groupId, Guid userId);
        Task<bool> RemoveUserFromGroupAsync(Guid groupId, Guid userId);
    }
}
