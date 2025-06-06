﻿using Microsoft.AspNetCore.Identity;
using OnlineTestSystem.BLL.Services.Base;
using OnlineTestSystem.BLL.ViewModels;
using OnlineTestSystem.BLL.ViewModels.Group;
using OnlineTestSystem.BLL.ViewModels.User;
using OnlineTestSystem.DAL.Models;

namespace OnlineTestSystem.BLL.Services.UserService
{
    public interface IUserService : IBaseService<User>
    {
        Task<IEnumerable<UserVm>> GetAllUserAsync();
        Task<PaginatedResult<UserVm>> FilterUsersAsync( string RoleName, FilterUserVm filterRequest, int pageIndex, int pageSize, string sortBy, string sortOrder);
        Task<UserVm?> GetUserByStudentCodeAsync(string studentCode);
        Task<UserVm> GetUserInfoAsync(Guid userId);
        Task<bool> AddUserAsync(CreateUserVm userVm);
        Task<bool> UpdateUserInfoAsync(Guid userId, UpdateUserVm updateUserVm);
        Task<int> DeleteAsync( Guid userId);
        Task<bool> ChangePasswordAsync(ChangePasswordVm vm);

        Task<IEnumerable<UserVm>> GetUsersByRoleNameAsync(string roleName);
    }
}
