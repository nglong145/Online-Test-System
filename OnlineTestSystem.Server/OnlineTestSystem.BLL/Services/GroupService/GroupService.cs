using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using OnlineTestSystem.BLL.Services.Base;
using OnlineTestSystem.BLL.Services.ExamService;
using OnlineTestSystem.BLL.Services.QuizService;
using OnlineTestSystem.BLL.ViewModels;
using OnlineTestSystem.BLL.ViewModels.Group;
using OnlineTestSystem.BLL.ViewModels.Quiz;
using OnlineTestSystem.BLL.ViewModels.User;
using OnlineTestSystem.DAL.Infrastructure;
using OnlineTestSystem.DAL.Models;
using System.Data;

namespace OnlineTestSystem.BLL.Services.GroupService
{
    // Group
    public class GroupService : BaseService<Group>, IGroupService
    {
        public GroupService(IUnitOfWork unitOfWork) : base(unitOfWork)
        {
        }

        public async Task<GroupVm> GetGroupByIdAsync(Guid groupId)
        {
            var group = await _unitOfWork.GenericRepository<Group>()
                .Get(g => g.Id == groupId)
                .Include(g => g.Manager)
                .FirstOrDefaultAsync();

            if (group == null)
            {
                throw new Exception("Group not found.");
            }

            var managerFirstName = group.Manager != null ? group.Manager.FirstName : null;
            var managerLastName = group.Manager != null ? group.Manager.LastName : null;

            return new GroupVm
            {
                Id = group.Id,
                Name = group.Name,
                Description = group.Description,
                IsActive = group.IsActive,
                CreatedAt = group.CreatedAt,
                UserManager = group.UserManager,
                ManagerFisrtName = managerFirstName,
                ManagerLastName = managerLastName
            };
        }


        public async Task<PaginatedResult<GroupVm>> GetGroupByManagerAsync(Guid manager, int pageIndex,
                                                              int pageSize, string? filterName)
        {
            var query = _unitOfWork.GenericRepository<Group>().GetQuery().Where(g => g.UserManager == manager);

            if (!string.IsNullOrEmpty(filterName))
            {
                query = query.Where(g => g.Name.Contains(filterName));
            }



            var groups = query.Select(group => new GroupVm
            {
                Id = group.Id,
                Name = group.Name,
                Description = group.Description,
                IsActive = group.IsActive,
                CreatedAt = group.CreatedAt,
                UserManager = group.UserManager,
                ManagerFisrtName = group.UserManager != null ? group.Manager.FirstName : null,
                ManagerLastName = group.UserManager != null ? group.Manager.LastName : null,
                MemeberCount = group.UserGroups.Count
            });


            return await PaginatedResult<GroupVm>.CreateAsync(groups, pageIndex, pageSize);
        }

        public async Task<PaginatedResult<GroupVm>> FilterGroupsAsync(FilterGroupVm filterRequest,
                                                              int pageIndex,
                                                              int pageSize,
                                                              string sortBy,
                                                              string sortOrder)
        {
            var query = _unitOfWork.GenericRepository<Group>().GetQuery();

            if (filterRequest.UserManager.HasValue || !string.IsNullOrEmpty(filterRequest.Name) ||
        !string.IsNullOrEmpty(filterRequest.Description))
            {
                query = query.Include(g => g.UserManager); 
            }

            if (!string.IsNullOrEmpty(filterRequest.Name))
            {
                query = query.Where(g => g.Name.Contains(filterRequest.Name));
            }

            if (!string.IsNullOrEmpty(filterRequest.Description))
            {
                query = query.Where(g => g.Description.Contains(filterRequest.Description));
            }

            if (filterRequest.IsActive.HasValue)
            {
                query = query.Where(g => g.IsActive == filterRequest.IsActive);
            }

            if (filterRequest.UserManager.HasValue)
            {
                query = query.Where(g => g.UserManager == filterRequest.UserManager);
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

            var groups = query.Select(group => new GroupVm
            {
                Id = group.Id,
                Name = group.Name,
                Description = group.Description,
                IsActive = group.IsActive,
                CreatedAt = group.CreatedAt,
                UserManager = group.UserManager,
                ManagerFisrtName = group.UserManager != null ? group.Manager.FirstName : null,
                ManagerLastName = group.UserManager != null ? group.Manager.LastName : null
            });


            return await PaginatedResult<GroupVm>.CreateAsync(groups, pageIndex, pageSize);
        }
    }


    // UserGroup
    public class UserGroupService : BaseService<UserGroup>, IUserGroupService
    {
        private readonly IUnitOfWork _unitOfWork;
        public UserGroupService(IUnitOfWork unitOfWork) : base(unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<PaginatedResult<UserVm>> GetUsersByGroupIdAsync(Guid groupId, int pageIndex, int pageSize)
        {
            var userGroupList = _unitOfWork.GenericRepository<UserGroup>()
                .Get(ug => ug.GroupId == groupId)
                .Include(ug => ug.User)
                .AsQueryable();

            var userVms = userGroupList.Select(ug => new UserVm
            {
                Id = ug.User.Id,
                StudentCode = ug.User.StudentCode,
                FirstName = ug.User.FirstName,
                LastName = ug.User.LastName,
                Email = ug.User.Email
            });

            return await PaginatedResult<UserVm>.CreateAsync(userVms, pageIndex, pageSize);
        }


        public async Task<bool> AddUserToGroupAsync(Guid groupId, Guid userId)
        {
            var exists = _unitOfWork.GenericRepository<UserGroup>()
                .Get(ug => ug.UserId == userId && ug.GroupId == groupId).Any();

            if (exists) return false;

            var userGroup = new UserGroup
            {
                UserId = userId,
                GroupId = groupId
            };

            _unitOfWork.GenericRepository<UserGroup>().Add(userGroup);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<bool> RemoveUserFromGroupAsync(Guid groupId, Guid userId)
        {
            var userGroup = await _unitOfWork.GenericRepository<UserGroup>()
                .Get(ug => ug.UserId == userId && ug.GroupId == groupId)
                .FirstOrDefaultAsync();

            if (userGroup == null) return false;

            _unitOfWork.GenericRepository<UserGroup>().Delete(userGroup);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

    }
}
