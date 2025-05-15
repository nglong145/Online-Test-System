using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using OnlineTestSystem.BLL.Services.Base;
using OnlineTestSystem.BLL.ViewModels;
using OnlineTestSystem.BLL.ViewModels.User;
using OnlineTestSystem.DAL.Data;
using OnlineTestSystem.DAL.Infrastructure;
using OnlineTestSystem.DAL.Models;

namespace OnlineTestSystem.BLL.Services.UserService
{
    public class UserService : BaseService<User>, IUserService
    {
        private readonly UserManager<User> _userManager;
        private readonly RoleManager<Role> _roleManager;
        private readonly TestSystemDbContext _context;

        public UserService(UserManager<User> userManager, RoleManager<Role> roleManager, TestSystemDbContext context,IUnitOfWork unitOfWork) : base(unitOfWork)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _context = context;
        }

        public async Task<IEnumerable<UserVm>> GetAllUserAsync()
        {
            var users = await _userManager.Users.ToListAsync();
            var userVms = new List<UserVm>();

            foreach (var user in users)
            {
                var role = await _roleManager.FindByIdAsync(user.RoleId.ToString());

                userVms.Add(new UserVm
                {
                    Id = user.Id,
                    StudentCode = user.StudentCode ?? string.Empty,
                    FirstName = user.FirstName ?? string.Empty,
                    LastName = user.LastName ?? string.Empty,
                    DateOfBirth = user.DateOfBirth ?? DateTime.MinValue,
                    Email = user.Email ?? string.Empty,
                    PhoneNumber = user.PhoneNumber ?? string.Empty,
                    Address = user.Address ?? string.Empty,
                    IsActive = user.IsActive,
                    RoleId = user.RoleId,
                    RoleName = role?.Name ?? string.Empty 
                });
            }

            return userVms;
        }

        public async Task<PaginatedResult<UserVm>> FilterUsersAsync(string roleName,FilterUserVm filterRequest, int pageIndex, int pageSize, string sortBy, string sortOrder)
        {
            var query = _unitOfWork.GenericRepository<User>().GetQuery();

            if (!string.IsNullOrEmpty(filterRequest.StudentCode))
            {
                query = query.Where(u => u.StudentCode.Contains(filterRequest.StudentCode));
            }

            if (!string.IsNullOrEmpty(filterRequest.Name))
            {
                query = query.Where(u => u.FirstName.Contains(filterRequest.Name) || u.LastName.Contains(filterRequest.Name));
            }

            if (!string.IsNullOrEmpty(filterRequest.Email))
            {
                query = query.Where(u => u.Email.Contains(filterRequest.Email));
            }

            if (!string.IsNullOrEmpty(filterRequest.Address))
            {
                query = query.Where(u => u.Address.Contains(filterRequest.Address));
            }

            if (!string.IsNullOrEmpty(filterRequest.PhoneNumber))
            {
                query = query.Where(u => u.PhoneNumber.Contains(filterRequest.PhoneNumber));
            }

            if (filterRequest.StartDate.HasValue)
            {
                query = query.Where(u => u.DateOfBirth >= filterRequest.StartDate.Value);
            }

            if (filterRequest.EndDate.HasValue)
            {
                query = query.Where(u => u.DateOfBirth <= filterRequest.EndDate.Value);
            }

            if (filterRequest.IsActive.HasValue)
            {
                query = query.Where(u => u.IsActive == filterRequest.IsActive);
            }

            if (!string.IsNullOrEmpty(roleName))
            {
                var role = await _roleManager.FindByNameAsync(roleName);
                if (role != null)
                {
                    query = query.Where(u => u.RoleId == role.Id);
                }
            }


            if (!string.IsNullOrEmpty(sortBy))
            {
                if (sortOrder.ToLower() == "asc")
                {
                    query = query.OrderByDynamic(sortBy, true); // Sắp xếp tăng dần
                }
                else
                {
                    query = query.OrderByDynamic(sortBy, false); // Sắp xếp giảm dần
                }
            }

            var users = query.Select(user => new UserVm
            {
                Id = user.Id,
                StudentCode = user.StudentCode ?? string.Empty,
                FirstName = user.FirstName ?? string.Empty,
                LastName = user.LastName ?? string.Empty,
                Email = user.Email ?? string.Empty,
                DateOfBirth = user.DateOfBirth,
                PhoneNumber = user.PhoneNumber ?? string.Empty,
                Address = user.Address ?? string.Empty,
                IsActive = user.IsActive,
                RoleId = user.RoleId
            });

            return await PaginatedResult<UserVm>.CreateAsync(users, pageIndex, pageSize);
        }

        public async Task<UserVm> GetUserInfoAsync(Guid userId)
        {
            var user = await _userManager.FindByIdAsync(userId.ToString());
            if (user == null)
            {
                throw new Exception("User not found.");
            }

            return new UserVm
            {
                Id = user.Id,
                StudentCode= user.StudentCode ?? string.Empty,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                Address = user.Address,
                DateOfBirth=user.DateOfBirth,
                IsActive = user.IsActive,
                RoleId = user.RoleId,
                RoleName = (await _roleManager.FindByIdAsync(user.RoleId.ToString()))?.Name
            };

        }

        public async Task<bool> AddUserAsync(CreateUserVm userVm)
        {
            var existingUser = await _userManager.FindByEmailAsync(userVm.Email);
            if (existingUser != null)
            {
                throw new Exception($"User with email {userVm.Email} already exists.");
            }

            var role = await _roleManager.FindByNameAsync(userVm.Role);

            var user = new User
            {
                StudentCode = userVm.StudentCode,
                FirstName = userVm.FirstName,
                LastName = userVm.LastName,
                Email = userVm.Email,
                PhoneNumber = userVm.PhoneNumber,
                DateOfBirth=userVm.DateOfBirth,
                Address = userVm.Address,
                RoleId = role.Id,
                UserName = userVm.Email
            };

            var result = await _userManager.CreateAsync(user, userVm.Password);
            return result.Succeeded;
        }

        public async Task<bool> UpdateUserInfoAsync(Guid userId, UpdateUserVm updateUserVm)
        {
            var user = await _userManager.FindByIdAsync(userId.ToString());
            if (user == null)
            {
                throw new Exception("User not found.");
            }

            user.StudentCode = updateUserVm.StudentCode;
            user.FirstName = updateUserVm.FirstName;
            user.LastName = updateUserVm.LastName;
            user.PhoneNumber = updateUserVm.PhoneNumber;
            user.DateOfBirth = updateUserVm.DateOfBirth;
            user.Address = updateUserVm.Address;
            user.IsActive= updateUserVm.IsActive;

            var result = await _userManager.UpdateAsync(user);
            return result.Succeeded;
        }

        public async Task<int> DeleteAsync(Guid userId)
        {
            var user = await _userManager.FindByIdAsync(userId.ToString());
            if (user != null)
            {
                var result = await _userManager.DeleteAsync(user);
                if (result.Succeeded)
                {
                    return 1; // Success
                }
            }
            return 0; // Failure
        }

        //public async Task<IEnumerable<UserVm>> GetUsersByGroupAsync(Guid groupId)
        //{
        //    var usersInGroup = await _context.UserGroups
        //        .Where(ug => ug.GroupId == groupId)
        //        .Include(ug => ug.User) 
        //        .ToListAsync();

        //    var userVms = new List<UserVm>();

        //    foreach (var user in usersInGroup)
        //    {
        //        var role = await _roleManager.FindByIdAsync(user.RoleId.ToString());

        //        userVms.Add(new UserVm
        //        {
        //            Id = user.Id,
        //            StudentCode = user.StudentCode ?? string.Empty,
        //            FirstName = user.FirstName ?? string.Empty,
        //            LastName = user.LastName ?? string.Empty,
        //            DateOfBirth = user.DateOfBirth ?? DateTime.MinValue,
        //            Email = user.Email ?? string.Empty,
        //            PhoneNumber = user.PhoneNumber ?? string.Empty,
        //            Address = user.Address ?? string.Empty,
        //            IsActive = user.IsActive,
        //            RoleId = user.RoleId,
        //            RoleName = role?.Name ?? string.Empty // Gán tên role sau khi tìm thấy
        //        });
        //    }

        //    return usersInGroup;

        //    var users = await _userManager.Users.ToListAsync();

        //    // Duyệt qua các user và lấy tên role bất đồng bộ
        //    var userVms = new List<UserVm>();

        //    foreach (var user in users)
        //    {
        //        var role = await _roleManager.FindByIdAsync(user.RoleId.ToString());

        //        userVms.Add(new UserVm
        //        {
        //            Id = user.Id,
        //            StudentCode = user.StudentCode ?? string.Empty,
        //            FirstName = user.FirstName ?? string.Empty,
        //            LastName = user.LastName ?? string.Empty,
        //            DateOfBirth = user.DateOfBirth ?? DateTime.MinValue,
        //            Email = user.Email ?? string.Empty,
        //            PhoneNumber = user.PhoneNumber ?? string.Empty,
        //            Address = user.Address ?? string.Empty,
        //            IsActive = user.IsActive,
        //            RoleId = user.RoleId,
        //            RoleName = role?.Name ?? string.Empty // Gán tên role sau khi tìm thấy
        //        });
        //    }

        //    return userVms;
        //}


        public async Task<IEnumerable<UserVm>> GetUsersByRoleNameAsync(string roleName)
        {
            var role = await _roleManager.FindByNameAsync(roleName);
            if (role == null)
            {
                throw new Exception($"Role with name {roleName} not found.");
            }

            var users = await _userManager.Users
                        .Where(u => u.RoleId == role.Id)
                        .ToListAsync();

            var userVms = new List<UserVm>();

            foreach (var user in users)
            {
                userVms.Add(new UserVm
                {
                    Id = user.Id,
                    StudentCode = user.StudentCode ?? string.Empty,
                    FirstName = user.FirstName ?? string.Empty,
                    LastName = user.LastName ?? string.Empty,
                    DateOfBirth = user.DateOfBirth ?? DateTime.MinValue,
                    Email = user.Email ?? string.Empty,
                    PhoneNumber = user.PhoneNumber ?? string.Empty,
                    Address = user.Address ?? string.Empty,
                    IsActive = user.IsActive,
                    RoleId = user.RoleId,
                    RoleName = roleName
                });
            }

            return userVms;

        }
    }
}
