using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Spreadsheet;
using DocumentFormat.OpenXml;
using Microsoft.EntityFrameworkCore;
using OfficeOpenXml;
using OnlineTestSystem.BLL.Services.Base;
using OnlineTestSystem.BLL.ViewModels;
using OnlineTestSystem.BLL.ViewModels.Answer;
using OnlineTestSystem.BLL.ViewModels.Exam;
using OnlineTestSystem.BLL.ViewModels.ExamExtend;
using OnlineTestSystem.BLL.ViewModels.ExamParticipant;
using OnlineTestSystem.BLL.ViewModels.ExamQuiz;
using OnlineTestSystem.BLL.ViewModels.Question;
using OnlineTestSystem.BLL.ViewModels.Quiz;
using OnlineTestSystem.DAL.Infrastructure;
using OnlineTestSystem.DAL.Models;
using System.Globalization;
using Group = OnlineTestSystem.DAL.Models.Group;
using FontSize = DocumentFormat.OpenXml.Spreadsheet.FontSize;

namespace OnlineTestSystem.BLL.Services.ExamService
{
    //Exam
    public class ExamService : BaseService<Exam>, IExamService
    {
        public ExamService(IUnitOfWork unitOfWork) : base(unitOfWork)
        {
        }

        public async Task<PaginatedResult<ExamVm>> GetExamListPaginationAsync(int pageIndex, int pageSize)
        {
            var query = _unitOfWork.GenericRepository<Exam>().Get()
                .Select(exam => new ExamVm
                {
                    Id = exam.Id,
                    Name = exam.Name,
                    Description = exam.Description,
                    AccessCode = exam.AccessCode,
                    StartTime = exam.StartTime,
                    EndTime = exam.EndTime,
                    IsActive= exam.IsActive,
                });

            return await PaginatedResult<ExamVm>.CreateAsync(query, pageIndex, pageSize);
        }

        public async Task<PaginatedResult<ExamVm>> FilterExamsAsync(FilterExamVm filterRequest,
                                                              int pageIndex,
                                                              int pageSize,
                                                              string sortBy,
                                                              string sortOrder)
        {
            var query = _unitOfWork.GenericRepository<Exam>().GetQuery();


            if (!string.IsNullOrEmpty(filterRequest.Name))
            {
                query = query.Where(e => e.Name.Contains(filterRequest.Name));
            }

            if (!string.IsNullOrEmpty(filterRequest.Description))
            {
                query = query.Where(e => e.Description.Contains(filterRequest.Description));
            }

            if (filterRequest.IsActive.HasValue)
            {
                query = query.Where(e => e.IsActive == filterRequest.IsActive);
            }

            if (filterRequest.StartedAt.HasValue)
                query = query.Where(q => q.StartTime >= filterRequest.StartedAt);


            if (filterRequest.FinishedAt.HasValue)
                query = query.Where(q => q.StartTime <= filterRequest.FinishedAt);


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

            var exams = query.Select(exam => new ExamVm
            {
                Id = exam.Id,
                Name = exam.Name,
                AccessCode = exam.AccessCode,
                StartTime = exam.StartTime,
                EndTime = exam.EndTime,
                Description = exam.Description,
                IsActive = exam.IsActive,
            });


            return await PaginatedResult<ExamVm>.CreateAsync(exams, pageIndex, pageSize);
        }

        public async Task<PaginatedResult<ExamVm>> FilterExamsUpcomingAsync(FilterExamVm filterRequest,
                                                              int pageIndex,
                                                              int pageSize,
                                                              string sortBy,
                                                              string sortOrder)
        {
            var query = _unitOfWork.GenericRepository<Exam>().GetQuery();


            if (!string.IsNullOrEmpty(filterRequest.Name))
            {
                query = query.Where(e => e.Name.Contains(filterRequest.Name));
            }

            if (!string.IsNullOrEmpty(filterRequest.Description))
            {
                query = query.Where(e => e.Description.Contains(filterRequest.Description));
            }

            if (filterRequest.IsActive.HasValue)
            {
                query = query.Where(e => e.IsActive == filterRequest.IsActive);
            }

            if (filterRequest.StartedAt.HasValue)
            {
                query = query.Where(e => e.StartTime >= filterRequest.StartedAt.Value);
            }

            else
                query = query.Where(e => e.StartTime >= DateTime.Now);

            if (filterRequest.FinishedAt.HasValue)
            {
                query = query.Where(e => e.StartTime <= filterRequest.FinishedAt.Value);
            }

            var exams = query.Select(exam => new ExamVm
            {
                Id = exam.Id,
                Name = exam.Name,
                AccessCode = exam.AccessCode,
                StartTime = exam.StartTime,
                EndTime = exam.EndTime,
                Description = exam.Description,
                IsActive = exam.IsActive,
                MemberCount = exam.UserQuizzes.Count(uq => uq.IsComplete && uq.ExamId == exam.Id) 
            });


            return await PaginatedResult<ExamVm>.CreateAsync(exams, pageIndex, pageSize);
        }


        public async Task<PaginatedResult<ExamVm>> FilterExamsOncomingAsync(FilterExamVm filterRequest,
                                                              int pageIndex,
                                                              int pageSize,
                                                              string sortBy,
                                                              string sortOrder)
        {

            var now = DateTime.Now;
            var query = _unitOfWork.GenericRepository<Exam>().GetQuery();

            query = query.Where(ep => ep.StartTime <= now && ep.EndTime >= now);


            if (!string.IsNullOrEmpty(filterRequest.Name))
            {
                query = query.Where(e => e.Name.Contains(filterRequest.Name));
            }

            if (!string.IsNullOrEmpty(filterRequest.Description))
            {
                query = query.Where(e => e.Description.Contains(filterRequest.Description));
            }

            if (filterRequest.IsActive.HasValue)
            {
                query = query.Where(e => e.IsActive == filterRequest.IsActive);
            }

            var exams = query.Select(exam => new ExamVm
            {
                Id = exam.Id,
                Name = exam.Name,
                AccessCode = exam.AccessCode,
                StartTime = exam.StartTime,
                EndTime = exam.EndTime,
                Description = exam.Description,
                IsActive = exam.IsActive,
                MemberCount = exam.UserQuizzes.Count(uq => uq.IsComplete && uq.ExamId == exam.Id)
            });


            return await PaginatedResult<ExamVm>.CreateAsync(exams, pageIndex, pageSize);
        }
    }

    //ExamGroup
    public class ExamGroupService : BaseService<ExamGroup>, IExamGroupService
    {
        private readonly IUnitOfWork _unitOfWork;
        public ExamGroupService(IUnitOfWork unitOfWork) : base(unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<bool> ExamGroupExistsAsync(Guid examId, Guid groupId)
        {
            return await _unitOfWork.GenericRepository<ExamGroup>()
                .GetQuery(eg => eg.ExamId == examId && eg.GroupId == groupId)
                .AnyAsync();
        }

        public async Task<bool> AddGroupToExamAsync(Guid examId, Guid groupId)
        {
            var exists = _unitOfWork.GenericRepository<ExamGroup>()
                .Get(q => q.ExamId == examId && q.GroupId == groupId).Any();

            if (exists) return false;

            var examGroup = new ExamGroup
            {
                ExamId = examId,
                GroupId = groupId
            };

            _unitOfWork.GenericRepository<ExamGroup>().Add(examGroup);
            await _unitOfWork.SaveChangesAsync();

            var group = await _unitOfWork.GenericRepository<Group>()
                        .Get(g => g.Id == groupId)
                        .Include(g => g.UserGroups)
                        .ThenInclude(ug => ug.User)
                        .FirstOrDefaultAsync();

            if (group != null)
            {
                foreach (var userGroup in group.UserGroups)
                {
                    var userId = userGroup.UserId;
                    bool alreadyExists = _unitOfWork.GenericRepository<ExamParticipant>()
                        .Get(ep => ep.ExamId == examId && ep.UserId == userId).Any();

                    if (!alreadyExists)
                    {
                        var examParticipant = new ExamParticipant
                        {
                            ExamId = examId,
                            UserId = userId,
                            Status = "Active" // hoặc trạng thái mặc định bạn muốn
                        };
                        _unitOfWork.GenericRepository<ExamParticipant>().Add(examParticipant);
                    }
                }
                await _unitOfWork.SaveChangesAsync();
            }

            return true;
        }

        public async Task<bool> RemoveGroupFromExamAsync(Guid examId, Guid groupId)
        {
            var examGroup = await _unitOfWork.GenericRepository<ExamGroup>()
         .Get(q => q.ExamId == examId && q.GroupId == groupId)
         .FirstOrDefaultAsync();

            if (examGroup == null) return false;

            // Lấy user thuộc group này
            var groupUserIds = await _unitOfWork.GenericRepository<UserGroup>()
                .Get(ug => ug.GroupId == groupId)
                .Select(ug => ug.UserId)
                .ToListAsync();

            foreach (var userId in groupUserIds)
            {
                // Kiểm tra user này còn thuộc group nào khác cùng exam không?
                var inOtherExamGroups = await (
      from eg in _unitOfWork.GenericRepository<ExamGroup>().Get(g => g.ExamId == examId && g.GroupId != groupId)
      join ug in _unitOfWork.GenericRepository<UserGroup>().GetQuery() on eg.GroupId equals ug.GroupId
      where ug.UserId == userId
      select ug
  ).AnyAsync();

                // Kiểm tra user này có được add trực tiếp vào kỳ thi không (ví dụ qua chức năng add user)?
                // Tuỳ cách lưu của bạn, nếu có cờ/isDirect/metadata thì kiểm tra thêm, còn nếu không thì bỏ qua bước này.

                if (!inOtherExamGroups)
                {
                    // Xóa participant
                    var participant = await _unitOfWork.GenericRepository<ExamParticipant>()
                        .Get(ep => ep.ExamId == examId && ep.UserId == userId)
                        .FirstOrDefaultAsync();

                    if (participant != null)
                    {
                        _unitOfWork.GenericRepository<ExamParticipant>().Delete(participant);
                    }
                }
            }

            // Xóa examGroup cuối cùng
            _unitOfWork.GenericRepository<ExamGroup>().Delete(examGroup);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }


        public async Task<PaginatedResult<ExamGroupVm>> FilterExamGroupsAsync(FilterExamGroupVm filterRequest,
                                                              int pageIndex,
                                                              int pageSize,
                                                              string sortBy,
                                                              string sortOrder)
        {
            var query = _unitOfWork.GenericRepository<ExamGroup>().GetQuery();

            if (filterRequest.ExamId.HasValue)
                query = query.Where(eg => eg.ExamId == filterRequest.ExamId);

            if (filterRequest.GroupId.HasValue)
                query = query.Where(eg => eg.GroupId == filterRequest.GroupId);

            if (filterRequest.UserManager.HasValue)
                query = query.Where(eg => eg.Group.UserManager == filterRequest.UserManager);




            if (!string.IsNullOrEmpty(filterRequest.ExamName))
            {
                query = query.Where(eg => eg.Exam.Name.Contains(filterRequest.ExamName));
            }

            if (filterRequest.StartTime.HasValue)
            {
                query = query.Where(eg => eg.Exam.StartTime >= filterRequest.StartTime.Value);
            }

            if (filterRequest.EndTime.HasValue)
            {
                query = query.Where(eg => eg.Exam.StartTime <= filterRequest.EndTime.Value);
            }

            if (!string.IsNullOrEmpty(filterRequest.GroupName))
            {
                query = query.Where(eg => eg.Group.Name.Contains(filterRequest.GroupName));
            }

            if (!string.IsNullOrEmpty(filterRequest.UserManagerName))
            {
                query = query.Where(eg => eg.Group.Manager.FirstName.Contains(filterRequest.UserManagerName) 
                                       || eg.Group.Manager.LastName.Contains(filterRequest.UserManagerName));
            }

            if (filterRequest.ExamStatus.HasValue)
            {
                query = query.Where(eg => eg.Exam.IsActive == filterRequest.ExamStatus);
            }

            if (filterRequest.GroupStatus.HasValue)
            {
                query = query.Where(eg => eg.Group.IsActive == filterRequest.GroupStatus);
            }

            var examGroups = query.Select(examGroup => new ExamGroupVm
            {
                ExamId = examGroup.ExamId,
                ExamName = examGroup.Exam.Name ?? string.Empty,
                AccessCode = examGroup.Exam.AccessCode,
                ExamDescription = examGroup.Exam.Description,
                StartTime = examGroup.Exam.StartTime,
                EndTime = examGroup.Exam.EndTime,
                ExamStatus = examGroup.Exam.IsActive,
                GroupId=examGroup.GroupId,
                GroupName=examGroup.Group.Name,
                GroupDescription=examGroup.Group.Description,
                UserManager=examGroup.Group.UserManager,
                UserManagerName=examGroup.Group.Manager.LastName + examGroup.Group.Manager.FirstName,
                GroupStatus=examGroup.Group.IsActive,
                CreatedAt=examGroup.Group.CreatedAt,
                
            });


            if (!string.IsNullOrEmpty(sortBy))
            {
                if (sortOrder.ToLower() == "asc")
                {
                    examGroups = examGroups.OrderByDynamic(sortBy, true); // Sắp xếp tăng dần
                }
                else
                {
                    examGroups = examGroups.OrderByDynamic(sortBy, false); // Sắp xếp giảm dần
                }
            }

            return await PaginatedResult<ExamGroupVm>.CreateAsync(examGroups, pageIndex, pageSize);
        }


    }

   // ExamUser
    public class ExamParticipantService : BaseService<ExamParticipant>, IExamParticipantService
    {
        private readonly IUnitOfWork _unitOfWork;
        public ExamParticipantService(IUnitOfWork unitOfWork) : base(unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<bool> ExamUserExistsAsync(Guid examId, Guid userId)
        {
            return await _unitOfWork.GenericRepository<ExamParticipant>()
                .GetQuery(ep => ep.UserId == userId && ep.ExamId == examId)
                .AnyAsync();
        }

        public async Task<bool> AddUserToExamAsync(Guid examId, Guid userId, AddUserToExamVm vm)
        {
            var exists = _unitOfWork.GenericRepository<ExamParticipant>()
                .Get(p => p.ExamId == examId && p.UserId == userId)
                .Any();

            if (exists) return false;

            var participant = new ExamParticipant
            {
                ExamId = examId,
                UserId = userId,
                Status = vm.Status,
                Note = vm.Note,
            };

            _unitOfWork.GenericRepository<ExamParticipant>().Add(participant);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<bool> RemoveUserFromExamAsync(Guid examId, Guid userId)
        {
            var repo = _unitOfWork.GenericRepository<ExamParticipant>();
            var entity = repo.Get(p => p.ExamId == examId && p.UserId == userId).FirstOrDefault();

            if (entity == null) return false;

            repo.Delete(entity);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<PaginatedResult<ExamParticipantVm>> FilterExamUsersAsync(FilterExamUserVm filterRequest,
                                                             int pageIndex,
                                                             int pageSize,
                                                             string sortBy,
                                                             string sortOrder)
        {
            var query = _unitOfWork.GenericRepository<ExamParticipant>().GetQuery();

            if (filterRequest.ExamId.HasValue)
                query = query.Where(ep => ep.ExamId == filterRequest.ExamId);

            if (filterRequest.UserId.HasValue)
                query = query.Where(ep => ep.UserId == filterRequest.UserId);

            if (filterRequest.RoleId.HasValue)
                query = query.Where(ep => ep.User.RoleId == filterRequest.RoleId);


            if (!string.IsNullOrEmpty(filterRequest.ExamName))
            {
                query = query.Where(ep => ep.Exam.Name.Contains(filterRequest.ExamName));
            }

            if (filterRequest.StartTime.HasValue)
            {
                query = query.Where(ep => ep.Exam.StartTime >= filterRequest.StartTime.Value);
            }

            if (filterRequest.EndTime.HasValue)
            {
                query = query.Where(ep => ep.Exam.StartTime <= filterRequest.EndTime.Value);
            }

            if (!string.IsNullOrEmpty(filterRequest.FullName))
            {
                query = query.Where(ep => ep.User.FirstName.Contains(filterRequest.FullName) || ep.User.LastName.Contains(filterRequest.FullName));
            }

            if (!string.IsNullOrEmpty(filterRequest.Email))
            {
                query = query.Where(ep => ep.User.Email.Contains(filterRequest.Email));
            }

            if (!string.IsNullOrEmpty(filterRequest.RoleName))
            {
                query = query.Where(ep => ep.User.Role.Name.Contains(filterRequest.RoleName));
            }

            if (filterRequest.ExamStatus.HasValue)
            {
                query = query.Where(ep => ep.Exam.IsActive == filterRequest.ExamStatus);
            }

            if (filterRequest.UserStatus.HasValue)
            {
                query = query.Where(ep => ep.User.IsActive == filterRequest.UserStatus);
            }

            if (!string.IsNullOrEmpty(filterRequest.ParticipantStatus))
            {
                query = query.Where(ep => ep.Status.Contains(filterRequest.ParticipantStatus));
            }

            var examUsers = query.Select(examUser => new ExamParticipantVm
            {
                ExamId = examUser.ExamId,
                ExamName = examUser.Exam.Name ?? string.Empty,
                AccessCode=examUser.Exam.AccessCode,
                ExamDescription=examUser.Exam.Description,
                StartTime = examUser.Exam.StartTime,
                EndTime = examUser.Exam.EndTime,
                ExamStatus=examUser.Exam.IsActive,
                UserId=examUser.UserId,
                FullName=examUser.User.LastName + ' '+ examUser.User.FirstName,
                StudentCode=examUser.User.StudentCode ?? string.Empty,
                DateOfBirth=examUser.User.DateOfBirth,
                Email=examUser.User.Email,
                PhoneNumber=examUser.User.PhoneNumber,
                Address=examUser.User.Address,
                RoleId=examUser.User.RoleId,
                RoleName=examUser.User.Role.Name,
                UserStatus=examUser.User.IsActive,
                ParticipantStatus=examUser.Status,
                Note=examUser.Note,
                CreatedAt=examUser.User.CreatedAt,
            });

            if (!string.IsNullOrEmpty(sortBy))
            {
                if (sortOrder.ToLower() == "asc")
                {
                    examUsers = examUsers.OrderByDynamic(sortBy, true); // Sắp xếp tăng dần
                }
                else
                {
                    examUsers = examUsers.OrderByDynamic(sortBy, false); // Sắp xếp giảm dần
                }
            }

            return await PaginatedResult<ExamParticipantVm>.CreateAsync(examUsers, pageIndex, pageSize);
        }


        public async Task<PaginatedResult<ExamParticipantVm>> FilterUpcomingExamsAsync(FilterExamUserVm filterRequest,
                                                             int pageIndex,
                                                             int pageSize,
                                                             string sortBy,
                                                             string sortOrder)
        {
            var query = _unitOfWork.GenericRepository<ExamParticipant>().GetQuery();

            if (filterRequest.ExamId.HasValue)
                query = query.Where(ep => ep.ExamId == filterRequest.ExamId);

            if (filterRequest.UserId.HasValue)
                query = query.Where(ep => ep.UserId == filterRequest.UserId);

            if (filterRequest.RoleId.HasValue)
                query = query.Where(ep => ep.User.RoleId == filterRequest.RoleId);


            if (!string.IsNullOrEmpty(filterRequest.ExamName))
            {
                query = query.Where(ep => ep.Exam.Name.Contains(filterRequest.ExamName));
            }

            if (!string.IsNullOrEmpty(filterRequest.FullName))
            {
                query = query.Where(ep => ep.User.FirstName.Contains(filterRequest.FullName) || ep.User.LastName.Contains(filterRequest.FullName));
            }

            if (!string.IsNullOrEmpty(filterRequest.Email))
            {
                query = query.Where(ep => ep.User.Email.Contains(filterRequest.Email));
            }

            if (!string.IsNullOrEmpty(filterRequest.RoleName))
            {
                query = query.Where(ep => ep.User.Role.Name.Contains(filterRequest.RoleName));
            }

            if (filterRequest.ExamStatus.HasValue)
            {
                query = query.Where(ep => ep.Exam.IsActive == filterRequest.ExamStatus);
            }

            if (filterRequest.UserStatus.HasValue)
            {
                query = query.Where(ep => ep.User.IsActive == filterRequest.UserStatus);
            }

            if (!string.IsNullOrEmpty(filterRequest.ParticipantStatus))
            {
                query = query.Where(ep => ep.Status.Contains(filterRequest.ParticipantStatus));
            }

            if (filterRequest.StartTime.HasValue)
            {
                query = query.Where(ep => ep.Exam.StartTime >= filterRequest.StartTime.Value);
            }

            else
                query = query.Where(ep=>ep.Exam.StartTime >= DateTime.UtcNow);

            if (filterRequest.EndTime.HasValue)
            {
                query = query.Where(ep => ep.Exam.StartTime <= filterRequest.EndTime.Value);
            }

            var examUsers = query.Select(examUser => new ExamParticipantVm
            {
                ExamId = examUser.ExamId,
                ExamName = examUser.Exam.Name ?? string.Empty,
                AccessCode = examUser.Exam.AccessCode,
                ExamDescription = examUser.Exam.Description,
                StartTime = examUser.Exam.StartTime,
                EndTime = examUser.Exam.EndTime,
                ExamStatus = examUser.Exam.IsActive,
                UserId = examUser.UserId,
                FullName = examUser.User.LastName + ' ' + examUser.User.FirstName,
                StudentCode = examUser.User.StudentCode ?? string.Empty,
                DateOfBirth = examUser.User.DateOfBirth,
                Email = examUser.User.Email,
                PhoneNumber = examUser.User.PhoneNumber,
                Address = examUser.User.Address,
                RoleId = examUser.User.RoleId,
                RoleName = examUser.User.Role.Name,
                UserStatus = examUser.User.IsActive,
                ParticipantStatus = examUser.Status,
                Note = examUser.Note,
                CreatedAt = examUser.User.CreatedAt,
            });

            if (!string.IsNullOrEmpty(sortBy))
            {
                if (sortOrder.ToLower() == "asc")
                {
                    examUsers = examUsers.OrderByDynamic(sortBy, true); // Sắp xếp tăng dần
                }
                else
                {
                    examUsers = examUsers.OrderByDynamic(sortBy, false); // Sắp xếp giảm dần
                }
            }

            return await PaginatedResult<ExamParticipantVm>.CreateAsync(examUsers, pageIndex, pageSize);
        }


        public async Task<PaginatedResult<ExamParticipantVm>> FilterOncomingExamsAsync(FilterExamUserVm filterRequest,
                                                           int pageIndex,
                                                           int pageSize,
                                                           string sortBy,
                                                           string sortOrder)
        {
            var now = DateTime.Now;
            var query = _unitOfWork.GenericRepository<ExamParticipant>().GetQuery();

            query = query.Where(ep => ep.Exam.StartTime <= now && ep.Exam.EndTime >= now);

            if (filterRequest.ExamId.HasValue)
                query = query.Where(ep => ep.ExamId == filterRequest.ExamId);

            if (filterRequest.UserId.HasValue)
                query = query.Where(ep => ep.UserId == filterRequest.UserId);

            if (filterRequest.RoleId.HasValue)
                query = query.Where(ep => ep.User.RoleId == filterRequest.RoleId);


            if (!string.IsNullOrEmpty(filterRequest.ExamName))
            {
                query = query.Where(ep => ep.Exam.Name.Contains(filterRequest.ExamName));
            }

            if (!string.IsNullOrEmpty(filterRequest.FullName))
            {
                query = query.Where(ep => ep.User.FirstName.Contains(filterRequest.FullName) || ep.User.LastName.Contains(filterRequest.FullName));
            }

            if (!string.IsNullOrEmpty(filterRequest.Email))
            {
                query = query.Where(ep => ep.User.Email.Contains(filterRequest.Email));
            }

            if (!string.IsNullOrEmpty(filterRequest.RoleName))
            {
                query = query.Where(ep => ep.User.Role.Name.Contains(filterRequest.RoleName));
            }

            if (filterRequest.ExamStatus.HasValue)
            {
                query = query.Where(ep => ep.Exam.IsActive == filterRequest.ExamStatus);
            }

            if (filterRequest.UserStatus.HasValue)
            {
                query = query.Where(ep => ep.User.IsActive == filterRequest.UserStatus);
            }

            if (!string.IsNullOrEmpty(filterRequest.ParticipantStatus))
            {
                query = query.Where(ep => ep.Status.Contains(filterRequest.ParticipantStatus));
            }


   

            var examUsers = query.Select(examUser => new ExamParticipantVm
            {
                ExamId = examUser.ExamId,
                ExamName = examUser.Exam.Name ?? string.Empty,
                AccessCode = examUser.Exam.AccessCode,
                ExamDescription = examUser.Exam.Description,
                StartTime = examUser.Exam.StartTime,
                EndTime = examUser.Exam.EndTime,
                ExamStatus = examUser.Exam.IsActive,
                UserId = examUser.UserId,
                FullName = examUser.User.LastName + ' ' + examUser.User.FirstName,
                StudentCode = examUser.User.StudentCode ?? string.Empty,
                DateOfBirth = examUser.User.DateOfBirth,
                Email = examUser.User.Email,
                PhoneNumber = examUser.User.PhoneNumber,
                Address = examUser.User.Address,
                RoleId = examUser.User.RoleId,
                RoleName = examUser.User.Role.Name,
                UserStatus = examUser.User.IsActive,
                ParticipantStatus = examUser.Status,
                Note = examUser.Note,
                CreatedAt = examUser.User.CreatedAt,
            });

            if (!string.IsNullOrEmpty(sortBy))
            {
                if (sortOrder.ToLower() == "asc")
                {
                    examUsers = examUsers.OrderByDynamic(sortBy, true); // Sắp xếp tăng dần
                }
                else
                {
                    examUsers = examUsers.OrderByDynamic(sortBy, false); // Sắp xếp giảm dần
                }
            }

            return await PaginatedResult<ExamParticipantVm>.CreateAsync(examUsers, pageIndex, pageSize);
        }

        public async Task<byte[]> ExportExamParticipantListToExcelAsync(Guid examId)
        {
            var exam = await _unitOfWork.GenericRepository<Exam>().GetQuery(e => e.Id == examId).FirstOrDefaultAsync();
            var participants = await _unitOfWork.GenericRepository<ExamParticipant>()
                .GetQuery(ep => ep.ExamId == examId)
                .Include(ep => ep.User)
                .ToListAsync();

            using var ms = new MemoryStream();
            using (SpreadsheetDocument document = SpreadsheetDocument.Create(ms, SpreadsheetDocumentType.Workbook))
            {
                WorkbookPart workbookPart = document.AddWorkbookPart();
                workbookPart.Workbook = new Workbook();
                WorksheetPart worksheetPart = workbookPart.AddNewPart<WorksheetPart>();
                var sheetData = new SheetData();
                worksheetPart.Worksheet = new Worksheet(sheetData);

                Sheets sheets = document.WorkbookPart.Workbook.AppendChild(new Sheets());
                Sheet sheet = new Sheet() { Id = document.WorkbookPart.GetIdOfPart(worksheetPart), SheetId = 1, Name = "DanhSach" };
                sheets.Append(sheet);

                WorkbookStylesPart stylesPart = workbookPart.AddNewPart<WorkbookStylesPart>();
                stylesPart.Stylesheet = GenerateBeautifulStylesheet();
                stylesPart.Stylesheet.Save();

                // Merge cells for big title
                MergeCells mergeCells = new MergeCells();
                mergeCells.Append(new MergeCell() { Reference = new StringValue("A1:G1") });
                worksheetPart.Worksheet.InsertAfter(mergeCells, worksheetPart.Worksheet.Elements<SheetData>().First());

                // Row 1: Big title (merge B1:I1, center, bold, font size lớn)
                var titleRow = new Row() { RowIndex = 1 };
                titleRow.Append(CreateCell("DANH SÁCH SINH VIÊN DỰ THI", CellValues.String, 2, "A1"));
                sheetData.Append(titleRow);

                // Row 2-5: Info (label bold left, value normal right)
                sheetData.Append(CreateInfoRow("Tên kỳ thi:", exam.Name, 2));
                sheetData.Append(CreateInfoRow("Mô tả:", exam.Description, 3));
                sheetData.Append(CreateInfoRow("Thời gian bẳt đầu:", exam.StartTime.ToString("dd/MM/yyyy HH:mm"), 4));
                sheetData.Append(CreateInfoRow("Thời gian kết thúc:", exam.EndTime.HasValue ? exam.EndTime.Value.ToString("dd/MM/yyyy HH:mm") : "", 5));

                // Blank row
                sheetData.Append(new Row());

                // Header row (bold, border, background gray)
                var headerRow = new Row();
                headerRow.Append(
                    CreateCell("STT", CellValues.String, 6),
                    CreateCell("Mã SV", CellValues.String, 6),
                    CreateCell("Họ và tên", CellValues.String, 6),
                    CreateCell("Ngày sinh", CellValues.String, 6),
                    CreateCell("Email", CellValues.String, 6),
                    CreateCell("Số điện thoại", CellValues.String, 6),
                    CreateCell("Địa chỉ", CellValues.String, 6),
                    CreateCell("Ghi chú", CellValues.String, 6)
                );
                sheetData.Append(headerRow);

                var sortedResults = participants
                                    .OrderBy(r => r.User?.FirstName ?? "")
                                    .ThenBy(r => r.User?.LastName ?? "")
                                    .ToList();

                // Data rows (borders, căn chỉnh hợp lý)
                int stt = 1;
                foreach (var p in sortedResults)
                {
                    var user = p.User;
                    sheetData.Append(
                        new Row(
                            CreateCell(stt.ToString(), CellValues.Number, 5),
                            CreateCell(user.StudentCode, CellValues.String, 5),
                            CreateCell($"{user.LastName} {user.FirstName}", CellValues.String, 7),
                            CreateCell(user.DateOfBirth?.ToString("dd/MM/yyyy") ?? "", CellValues.String, 5),
                            CreateCell(user.Email, CellValues.String, 7),
                            CreateCell(user.PhoneNumber, CellValues.String, 5),
                            CreateCell(user.Address, CellValues.String, 7),
                            CreateCell(p.Note ?? "", CellValues.String, 4)
                        )
                    );
                    stt++;
                }

                // Set column width (auto-fit style, hoặc set cố định)
                Columns columns = new Columns(
                    new Column() { Min = 2, Max = 2, Width = 12, CustomWidth = true }, // Mã SV
                    new Column() { Min = 3, Max = 3, Width = 25, CustomWidth = true }, // Họ tên
                    new Column() { Min = 4, Max = 4, Width = 13, CustomWidth = true }, // Ngày sinh
                    new Column() { Min = 5, Max = 5, Width = 30, CustomWidth = true }, // Email
                    new Column() { Min = 6, Max = 6, Width = 15, CustomWidth = true }, // SĐT
                    new Column() { Min = 7, Max = 7, Width = 30, CustomWidth = true }, // Địa chỉ
                    new Column() { Min = 8, Max = 8, Width = 12, CustomWidth = true }  // Ghi chú
                );
                worksheetPart.Worksheet.InsertAt(columns, 0);

                worksheetPart.Worksheet.Save();
            }
            return ms.ToArray();
        }

        // Cell + format
        Cell CreateCell(string value, CellValues type, uint styleIndex = 0, string? cellReference = null, HorizontalAlignmentValues? alignment = null)
        {
            var cell = new Cell()
            {
                DataType = new EnumValue<CellValues>(type),
                CellValue = new CellValue(value ?? ""),
                StyleIndex = styleIndex
            };
            if (cellReference != null) cell.CellReference = cellReference;
            return cell;
        }

        Row CreateInfoRow(string label, string value, uint rowIdx)
        {
            var row = new Row() { RowIndex = rowIdx };
            row.Append(CreateCell(label, CellValues.String, 1), CreateCell(value, CellValues.String, 3));
            return row;
        }

        // Style đẹp: 0-normal, 1-bold-border, 2-title, 3-border, 4-header-gray
        Stylesheet GenerateBeautifulStylesheet()
        {
            return new Stylesheet(
                new Fonts(
                    new Font(), // 0 - Normal
                    new Font(new Bold()), // 1 - Bold
                    new Font(new Bold(), new FontSize() { Val = 16 }), // 2 - Title bold lớn
                    new Font(new Bold(), new Color { Rgb = "FFFFFF" }) // 3 - White (chưa dùng)
                ),
                new Fills(
                    new Fill(new PatternFill() { PatternType = PatternValues.None }), // 0 - Default
                   new Fill(new PatternFill()
                   {
                       PatternType = PatternValues.Solid,
                       ForegroundColor = new ForegroundColor { Rgb = HexBinaryValue.FromString("D9EAF7") }, // Màu xanh dương nhạt
                       BackgroundColor = new BackgroundColor { Indexed = 64 }
                   })
                ),
                new Borders(
                    new Border(), // 0 - Default
                    new Border( // 1 - All border
                        new LeftBorder { Style = BorderStyleValues.Thin },
                        new RightBorder { Style = BorderStyleValues.Thin },
                        new TopBorder { Style = BorderStyleValues.Thin },
                        new BottomBorder { Style = BorderStyleValues.Thin },
                        new DiagonalBorder())
                ),
                new CellFormats(
                    new CellFormat(), // 0 - Default
                    new CellFormat() { FontId = 1, Alignment = new Alignment() { WrapText = true } }, // 1 - Label bold
                    new CellFormat() { FontId = 2, Alignment = new Alignment() { Horizontal = HorizontalAlignmentValues.Center } }, // 2 - Title
                    new CellFormat()
                    {
                        Alignment = new Alignment {Vertical = VerticalAlignmentValues.Center } // center 
                    }, // 3 
                     new CellFormat()
                     {
                         BorderId = 1,
                         ApplyBorder = true,
                     }, // 4 - Border all
                    new CellFormat()
                    {
                        BorderId = 1,
                        ApplyBorder = true,
                        Alignment = new Alignment { Horizontal = HorizontalAlignmentValues.Center, Vertical = VerticalAlignmentValues.Center }
                    }, // 5 - Border all + center

                    new CellFormat() { FontId = 1, FillId = 0, BorderId = 1, ApplyFill = true, ApplyBorder = true, Alignment = new Alignment { Horizontal = HorizontalAlignmentValues.Center } },  // 6 - Header bold, border, gray, center
                    new CellFormat() { BorderId = 1, ApplyBorder = true, Alignment = new Alignment() { WrapText = true, Vertical = VerticalAlignmentValues.Top } } //7
                )
            );
        }

    }

    //ExamQuiz
    public class ExamQuizService : BaseService<ExamQuiz>, IExamQuizService
    {
        private readonly IUnitOfWork _unitOfWork;
        public ExamQuizService(IUnitOfWork unitOfWork) : base(unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<bool> ExamQuizExistsAsync(Guid examId, Guid quizId)
        {
            return await _unitOfWork.GenericRepository<ExamQuiz>()
                .GetQuery(eq => eq.ExamId == examId && eq.QuizId == quizId)
                .AnyAsync();
        }

        public async Task<bool> AddQuizToExamAsync(Guid examId, Guid quizId)
        {
            var exists = _unitOfWork.GenericRepository<ExamQuiz>()
                .Get(p => p.ExamId == examId && p.QuizId == quizId)
                .Any();

            if (exists) return false;

            var maxOrder = await _unitOfWork.GenericRepository<ExamQuiz>()
        .Get(eq => eq.ExamId == examId)
        .Select(eq => (int?)eq.Order)
        .MaxAsync() ?? 0;

            var quiz = new ExamQuiz
            {
                ExamId = examId,
                QuizId = quizId,
                Order = maxOrder + 1,
            };

            _unitOfWork.GenericRepository<ExamQuiz>().Add(quiz);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<bool> RemoveQuizFromExamAsync(Guid examId, Guid quizId)
        {
            var examQuiz = await _unitOfWork.GenericRepository<ExamQuiz>()
                .Get(q => q.ExamId == examId && q.QuizId == quizId)
                .FirstOrDefaultAsync();

            if (examQuiz == null) return false; // Không tìm thấy đề thi trong kỳ thi.

            _unitOfWork.GenericRepository<ExamQuiz>().Delete(examQuiz);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }


        public async Task<PaginatedResult<ExamQuizVm>> FilterExamQuizzesAsync(FilterExamQuizVm filterRequest, int pageIndex, int pageSize, string sortBy,
                                                             string sortOrder)
        {
            var query = _unitOfWork.GenericRepository<ExamQuiz>().GetQuery();

            if (filterRequest.ExamId.HasValue)
                query = query.Where(eq => eq.ExamId == filterRequest.ExamId);

            if (filterRequest.QuizId.HasValue)
                query = query.Where(eq => eq.QuizId == filterRequest.QuizId);


            if (!string.IsNullOrEmpty(filterRequest.ExamName))
            {
                query = query.Where(eq => eq.Exam.Name.Contains(filterRequest.ExamName));
            }

            if (!string.IsNullOrEmpty(filterRequest.Title))
            {
                query = query.Where(eq => eq.Quiz.Title.Contains(filterRequest.Title));
            }

            if (filterRequest.StartTime.HasValue)
            {
                query = query.Where(eq => eq.Exam.StartTime >= filterRequest.StartTime.Value);
            }

            if (filterRequest.EndTime.HasValue)
            {
                query = query.Where(eq => eq.Exam.StartTime <= filterRequest.EndTime.Value);
            }

            if (filterRequest.Duration.HasValue)
            {
                query = query.Where(eq => eq.Quiz.Duration >= filterRequest.Duration);
            }


            var examQuizzes = query.Select(examQuiz => new ExamQuizVm
            {
                ExamId = examQuiz.ExamId,
                ExamName = examQuiz.Exam.Name ?? string.Empty,
                StartTime = examQuiz.Exam.StartTime,
                EndTime = examQuiz.Exam.EndTime,
                QuizId = examQuiz.QuizId,
                Title = examQuiz.Quiz.Title ?? string.Empty,
                Duration = examQuiz.Quiz.Duration,
                TotalQuestion= examQuiz.Quiz.QuizQuestions.Count,
            });

            if (!string.IsNullOrEmpty(sortBy))
            {
                if (sortOrder.ToLower() == "asc")
                {
                    examQuizzes = examQuizzes.OrderByDynamic(sortBy, true); 
                }
                else
                {
                    examQuizzes = examQuizzes.OrderByDynamic(sortBy, false); 
                }
            }

            return await PaginatedResult<ExamQuizVm>.CreateAsync(examQuizzes, pageIndex, pageSize);
        }


        public async Task<QuizWithDetailVm?> GetRandomQuizForExamAsync(Guid examId)
        {
            // Lấy danh sách quiz đã gán cho exam
            var examQuizzes = await _unitOfWork.GenericRepository<ExamQuiz>()
                .Get(eq => eq.ExamId == examId)
                .ToListAsync();

            if (examQuizzes == null || !examQuizzes.Any())
                return null; // Không có quiz nào gán cho exam

            var random = new Random();
            var randomQuiz = examQuizzes[random.Next(examQuizzes.Count)];

            // Lấy chi tiết quiz (câu hỏi, đáp án, duration, ...)
            var quizDetail = await _unitOfWork.GenericRepository<Quiz>()
                .Get(q => q.Id == randomQuiz.QuizId, includesProperties: "QuizQuestions.Question.Answers,QuizCategory")
                .FirstOrDefaultAsync();

            if (quizDetail == null)
                return null;

            var result = new QuizWithDetailVm
            {
                Id = quizDetail.Id,
                Title = quizDetail.Title,
                Category = quizDetail.Category,
                CategoryName = quizDetail.QuizCategory?.Name ?? "",
                Description = quizDetail.Description,
                Duration = quizDetail.Duration,
                IsActive = quizDetail.IsActive,
                CreatedAt = quizDetail.CreatedAt,
                Questions = quizDetail.QuizQuestions
                    .OrderBy(qq => qq.Order)
                    .Select(qq => new QuestionWithAnswersVm
                    {
                        Id = qq.Question.Id,
                        Content = qq.Question.Content,
                        Order = qq.Order,
                        Score = qq.Score,
                        QuestionType = qq.Question.QuestionType.ToString(),
                        Level = qq.Question.Level.ToString(),
                        IsActive = qq.Question.IsActive,
                        Answers = qq.Question.Answers
                            .OrderBy(a => a.Order)
                            .Select(a => new AnswerVm
                            {
                                Id = a.Id,
                                Content = a.Content,
                                Order = a.Order,
                                IsCorrect = a.IsCorrect,
                                IsActive = a.IsActive,
                                QuestionId = a.QuestionId
                            }).ToList()
                    }).ToList()
            };

            return result;
        }
    }
}
