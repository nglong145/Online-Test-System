using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using OnlineTestSystem.BLL.Services.Base;
using OnlineTestSystem.BLL.ViewModels;
using OnlineTestSystem.BLL.ViewModels.Exam;
using OnlineTestSystem.BLL.ViewModels.ExamExtend;
using OnlineTestSystem.BLL.ViewModels.ExamQuiz;
using OnlineTestSystem.BLL.ViewModels.Group;
using OnlineTestSystem.BLL.ViewModels.User;
using OnlineTestSystem.DAL.Infrastructure;
using OnlineTestSystem.DAL.Models;

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

    }

    //ExamGroup
    public class ExamGroupService : BaseService<ExamGroup>, IExamGroupService
    {
        private readonly IUnitOfWork _unitOfWork;
        public ExamGroupService(IUnitOfWork unitOfWork) : base(unitOfWork)
        {
            _unitOfWork = unitOfWork;
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
            return true;
        }

        public async Task<bool> RemoveGroupFromExamAsync(Guid examId, Guid groupId)
        {
            var examGroup = await _unitOfWork.GenericRepository<ExamGroup>()
                .Get(q => q.ExamId == examId && q.GroupId == groupId)
                .FirstOrDefaultAsync();

            if (examGroup == null) return false; 

            _unitOfWork.GenericRepository<ExamGroup>().Delete(examGroup);
            await _unitOfWork.SaveChangesAsync();
            return true;
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
    }

    //ExamQuiz
    public class ExamQuizService : BaseService<ExamQuiz>, IExamQuizService
    {
        private readonly IUnitOfWork _unitOfWork;
        public ExamQuizService(IUnitOfWork unitOfWork) : base(unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<bool> AddQuizToExamAsync(Guid examId, Guid quizId, AddQuizToExamVm vm)
        {
            var exists = _unitOfWork.GenericRepository<ExamQuiz>()
                .Get(p => p.ExamId == examId && p.QuizId == quizId)
                .Any();

            if (exists) return false;

            var quiz = new ExamQuiz
            {
                ExamId = examId,
                QuizId = quizId,
                Order = vm.Order,
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


        public async Task<PaginatedResult<ExamQuizVm>> FilterExamQuizzesAsync(FilterExamQuizVm filterRequest, int pageIndex, int pageSize)
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

            return await PaginatedResult<ExamQuizVm>.CreateAsync(examQuizzes, pageIndex, pageSize);
        }
    }
}
