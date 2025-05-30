using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using OnlineTestSystem.BLL.Services.Base;
using OnlineTestSystem.BLL.Services.ExamService;
using OnlineTestSystem.BLL.Services.QuizService;
using OnlineTestSystem.BLL.ViewModels;
using OnlineTestSystem.BLL.ViewModels.Group;
using OnlineTestSystem.BLL.ViewModels.Quiz;
using OnlineTestSystem.BLL.ViewModels.User;
using OnlineTestSystem.BLL.ViewModels.UserGroup;
using OnlineTestSystem.DAL.Infrastructure;
using OnlineTestSystem.DAL.Models;
using System.Data;

namespace OnlineTestSystem.BLL.Services.GroupService
{
    // Group
    public class GroupService : BaseService<Group>, IGroupService
    {
        private readonly IUnitOfWork _unitOfWork;
        public GroupService(IUnitOfWork unitOfWork) : base(unitOfWork)
        {
            _unitOfWork = unitOfWork;
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


        public async Task<PaginatedResult<GroupVm>> GetGroupByManagerAsync(FilterGroupVm filterRequest,
                                                              int pageIndex,
                                                              int pageSize,
                                                              string sortBy,
                                                              string sortOrder)
        {
            var query = _unitOfWork.GenericRepository<Group>().GetQuery().Where(g => g.UserManager == filterRequest.UserManager);

            if (!string.IsNullOrEmpty(filterRequest.Name))
            {
                query = query.Where(g => g.Name.Contains(filterRequest.Name));
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
                MemberCount = group.UserGroups.Count
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

            if (!string.IsNullOrEmpty(filterRequest.ManagerName))
            {
                query = query.Where(g => g.Manager.FirstName.Contains(filterRequest.ManagerName) || g.Manager.LastName.Contains(filterRequest.ManagerName));
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
                ManagerLastName = group.UserManager != null ? group.Manager.LastName : null,
                MemberCount = _unitOfWork.GenericRepository<UserGroup>()
                              .GetQuery()
                              .Count(ug => ug.GroupId == group.Id)
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

        public async Task<PaginatedResult<UserGroupVm>> FilterUserGroupsAsync(UserGroupFilterVm filterRequest,
                                                               int pageIndex,
                                                               int pageSize,
                                                               string sortBy,
                                                               string sortOrder)
        {
            var query = _unitOfWork.GenericRepository<UserGroup>().GetQuery();

            if (filterRequest.GroupId.HasValue)
            {
                query = query.Where(ug => ug.GroupId == filterRequest.GroupId);
            }

            if (!string.IsNullOrEmpty(filterRequest.GroupName))
            {
                query = query.Where(ug => ug.Group.Name.Contains(filterRequest.GroupName));
            }

            if (filterRequest.GroupActive.HasValue)
            {
                query = query.Where(ug => ug.Group.IsActive == filterRequest.GroupActive);
            }

            if (filterRequest.UserManager.HasValue)
            {
                query = query.Where(ug => ug.Group.UserManager == filterRequest.UserManager);
            }

            if (!string.IsNullOrEmpty(filterRequest.ManagerName))
            {
                query = query.Where(ug => ug.Group.Manager.FirstName.Contains(filterRequest.ManagerName) || ug.Group.Manager.LastName.Contains(filterRequest.ManagerName));
            }



            if (filterRequest.UserId.HasValue)
            {
                query = query.Where(ug => ug.UserId == filterRequest.UserId);
            }

            if (!string.IsNullOrEmpty(filterRequest.FullName))
            {
                query = query.Where(ug => ug.User.FirstName.Contains(filterRequest.FullName) || ug.User.LastName.Contains(filterRequest.FullName));
            }


            if (!string.IsNullOrEmpty(filterRequest.StudentCode))
            {
                query = query.Where(ug => ug.User.StudentCode.Contains(filterRequest.StudentCode));
            }

            if (filterRequest.UserActive.HasValue)
            {
                query = query.Where(ug => ug.User.IsActive == filterRequest.UserActive);
            }

            if (filterRequest.RoleId.HasValue)
            {
                query = query.Where(ug => ug.User.RoleId == filterRequest.RoleId);
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

            var userGroups = query.Select(userGroup => new UserGroupVm
            {
                GroupId = userGroup.GroupId,
                GroupName = userGroup.Group.Name,
                Description = userGroup.Group.Description,
                CreatedAt = userGroup.Group.CreatedAt,
                UserManager = userGroup.Group.UserManager,
                MemberCount = userGroup.Group.UserGroups.Count,
                ManagerFisrtName = userGroup.Group.Manager.FirstName,
                ManagerLastName = userGroup.Group.Manager.LastName,
                UserId = userGroup.UserId,
                FullName = userGroup.User.LastName +' '+ userGroup.User.FirstName,
                StudentCode = userGroup.User.StudentCode,
                DateOfBirth = userGroup.User.DateOfBirth,
                Email = userGroup.User.Email,
                PhoneNumber = userGroup.User.PhoneNumber,
                Address = userGroup.User.Address,
                IsActive = userGroup.User.IsActive,
                RoleId = userGroup.User.RoleId,
                RoleName = userGroup.User.Role.Name

                //MemberCount = _unitOfWork.GenericRepository<UserGroup>()
                //              .GetQuery()
                //              .Count(ug => ug.GroupId == group.Id)
            });


            return await PaginatedResult<UserGroupVm>.CreateAsync(userGroups, pageIndex, pageSize);
        }

        public async Task<bool> ExistsAsync(Guid groupId, Guid userId)
        {
            return await _unitOfWork.GenericRepository<UserGroup>()
                .GetQuery(ug => ug.UserId == userId && ug.GroupId == groupId)
                .AnyAsync();
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
