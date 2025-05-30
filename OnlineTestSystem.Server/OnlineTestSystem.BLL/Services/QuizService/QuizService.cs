using Microsoft.EntityFrameworkCore;
using OnlineTestSystem.BLL.Services.Base;
using OnlineTestSystem.BLL.ViewModels;
using OnlineTestSystem.BLL.ViewModels.Answer;
using OnlineTestSystem.BLL.ViewModels.Question;
using OnlineTestSystem.BLL.ViewModels.Quiz;
using OnlineTestSystem.BLL.ViewModels.QuizCategory;
using OnlineTestSystem.DAL.Infrastructure;
using OnlineTestSystem.DAL.Models;

namespace OnlineTestSystem.BLL.Services.QuizService
{
    public class QuizService : BaseService<Quiz>, IQuizService
    {
        public QuizService(IUnitOfWork unitOfWork) : base(unitOfWork)
        {
        }

        //get detail with questions and answers
        public async Task<QuizWithDetailVm?> GetQuizFullDetailAsync(Guid quizId)
        {
            var quiz = await _unitOfWork.GenericRepository<Quiz>()
                .Get(q => q.Id == quizId, includesProperties: "QuizQuestions.Question.Answers")
                .FirstOrDefaultAsync();

            if (quiz == null) return null;

            var result = new QuizWithDetailVm
            {
                Id = quiz.Id,
                Title = quiz.Title,
                Category= quiz.Category,
                CategoryName=quiz.QuizCategory?.Name,
                Description = quiz.Description,
                Duration = quiz.Duration,
                IsActive = quiz.IsActive,
                Questions = quiz.QuizQuestions
                    .OrderBy(qq => qq.Order)
                    .Select(qq => new QuestionWithAnswersVm
                    {
                        Id = qq.Question.Id,
                        Content = qq.Question.Content,
                        QuestionType = qq.Question.QuestionType.ToString(),
                        Level = qq.Question.Level.ToString(),
                        IsActive = qq.Question.IsActive,
                        Order = qq.Order,
                        Score = qq.Score,
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

        public async Task<PaginatedResult<QuizVm>> FilterQuizzesAsync(FilterQuizVm filterRequest,
                                                               int pageIndex,
                                                               int pageSize,
                                                               string sortBy,
                                                               string sortOrder)
        {
            var query = _unitOfWork.GenericRepository<Quiz>().GetQuery();


            if (!string.IsNullOrEmpty(filterRequest.Title))
            {
                query = query.Where(q => q.Title.Contains(filterRequest.Title));
            }

            if (filterRequest.Category.HasValue)
                query = query.Where(q => q.Category == filterRequest.Category);

            if (!string.IsNullOrEmpty(filterRequest.CategoryName))
            {
                query = query.Where(q => q.QuizCategory.Name.Contains(filterRequest.CategoryName));
            }

            if (!string.IsNullOrEmpty(filterRequest.Description))
            {
                query = query.Where(q => q.Description.Contains(filterRequest.Description));
            }

            if (filterRequest.Duration.HasValue)
            {
                query = query.Where(q => q.Duration == filterRequest.Duration);
            }

            if (filterRequest.IsActive.HasValue)
            {
                query = query.Where(q => q.IsActive == filterRequest.IsActive);
            }


            if (!string.IsNullOrEmpty(sortBy))
            {
                if (sortOrder.ToLower() == "asc")
                {
                    query = query.OrderByDynamic(sortBy, true);
                }
                else
                {
                    query = query.OrderByDynamic(sortBy, false);
                }
            }

            var quizzes = query.Select(quiz => new QuizVm
            {
                Id = quiz.Id,
                Title = quiz.Title,
                Category = quiz.Category,
                CategoryName = quiz.QuizCategory.Name,
                Description = quiz.Description,
                Duration= quiz.Duration,
                TotalQuestion= quiz.QuizQuestions.Count,
                IsActive = quiz.IsActive,
                CreatedAt = quiz.CreatedAt,
            });


            return await PaginatedResult<QuizVm>.CreateAsync(quizzes, pageIndex, pageSize);
        }


        // Random create quiz 
        public async Task<List<Quiz>> GenerateRandomQuizzesAsync(Guid questionBankId, int numberOfQuestionsPerQuiz, int numberOfQuizzes,float Score, int duration )
        {
            DateTime now = DateTime.Now;
            string formattedDate = now.ToString("dd/MM/yyyy");

            if (numberOfQuestionsPerQuiz <= 0 || numberOfQuizzes <= 0)
                throw new ArgumentException("Số lượng câu hỏi mỗi đề và số lượng đề phải lớn hơn 0.");

            var allQuestions = _unitOfWork.GenericRepository<Question>()
                .GetQuery(q => q.BankId == questionBankId && q.IsActive)
                .ToList();

            if (allQuestions.Count < numberOfQuestionsPerQuiz)
                throw new InvalidOperationException("Số lượng câu hỏi trong ngân hàng không đủ để tạo đề thi.");

            var quizzes = new List<Quiz>();

            var bank = _unitOfWork.GenericRepository<QuestionBank>()
                .GetQuery(b => b.Id == questionBankId).FirstOrDefault();

            await _unitOfWork.BeginTransactionAsync();

            try
            {
                var rnd = new Random();

                for (int i = 0; i < numberOfQuizzes; i++)
                {
                    var selectedQuestions = allQuestions.Shuffle().Take(numberOfQuestionsPerQuiz).ToList();

                    var quiz = new Quiz
                    {
                        Id = Guid.NewGuid(),
                        Title = $"Đề thi {bank.Name} #{i + 1} ngày {formattedDate}",
                        Category = bank.QuizCategoryId,
                        Description = $"Đề thi được tạo tự động từ ngân hàng câu hỏi {bank.Name}",
                        Duration = duration,
                        IsActive = true,
                        CreatedAt = DateTime.Now,
                    };

                    _unitOfWork.GenericRepository<Quiz>().Add(quiz);

                    var orderList = Enumerable.Range(1, numberOfQuestionsPerQuiz).Shuffle().ToList();

                    float questionScore = Score / numberOfQuestionsPerQuiz;
                    for (int j = 0; j < numberOfQuestionsPerQuiz; j++)
                    {
                        var qq = new QuizQuestion
                        {
                            QuizId = quiz.Id,
                            QuestionId = selectedQuestions[j].Id,
                            Order = orderList[j],
                            Score = questionScore,
                        };
                        _unitOfWork.GenericRepository<QuizQuestion>().Add(qq);
                    }

                    quizzes.Add(quiz);
                }

                await _unitOfWork.SaveChangesAsync();
                await _unitOfWork.CommitTransactionAsync();

                return quizzes;
            }
            catch
            {
                await _unitOfWork.RollbackTransactionAsync();
                throw;
            }
        }


        // Random create quiz by level
        public async Task<List<Quiz>> GenerateRandomQuizzesByLevelAsync(Guid questionBankId, int easyCount, int mediumCount, int hardCount, int numberOfQuizzes, int duration)
        {
            if (easyCount < 0 || mediumCount < 0 || hardCount < 0 || numberOfQuizzes <= 0)
                throw new ArgumentException("Số lượng câu hỏi từng mức và số đề phải lớn hơn 0.");

            var allQuestions = _unitOfWork.GenericRepository<Question>()
                .GetQuery(q => q.BankId == questionBankId && q.IsActive)
                .ToList();

            if (allQuestions.Count < easyCount + mediumCount + hardCount)
                throw new InvalidOperationException("Số lượng câu hỏi trong ngân hàng không đủ để tạo đề thi.");

            var quizzes = new List<Quiz>();
            var bank = _unitOfWork.GenericRepository<QuestionBank>()
                .GetQuery(b => b.Id == questionBankId).FirstOrDefault();

            await _unitOfWork.BeginTransactionAsync();
            try
            {
                for (int i = 0; i < numberOfQuizzes; i++)
                {
                    var selectedQuestions = allQuestions.ShuffleByLevel(easyCount, mediumCount, hardCount).ToList();

                    var quiz = new Quiz
                    {
                        Id = Guid.NewGuid(),
                        Title = $"Đề thi ngẫu nhiên #{i + 1}",
                        Category = bank.QuizCategoryId,
                        Description = $"Đề thi được tạo tự động từ ngân hàng câu hỏi {bank.Name}",
                        Duration = duration,
                        IsActive = true,
                        CreatedAt = DateTime.Now,
                    };

                    _unitOfWork.GenericRepository<Quiz>().Add(quiz);

                    var orderList = Enumerable.Range(1, selectedQuestions.Count).Shuffle().ToList();

                    for (int j = 0; j < selectedQuestions.Count; j++)
                    {
                        var qq = new QuizQuestion
                        {
                            QuizId = quiz.Id,
                            QuestionId = selectedQuestions[j].Id,
                            Order = orderList[j],
                            Score = 1,
                        };
                        _unitOfWork.GenericRepository<QuizQuestion>().Add(qq);
                    }

                    quizzes.Add(quiz);
                }

                await _unitOfWork.SaveChangesAsync();
                await _unitOfWork.CommitTransactionAsync();

                return quizzes;
            }
            catch
            {
                await _unitOfWork.RollbackTransactionAsync();
                throw;
            }
        }
    }

    public class QuizQuestionService : BaseService<QuizQuestion>, IQuizQuestionService
    {
        public QuizQuestionService(IUnitOfWork unitOfWork) : base(unitOfWork)
        {
        }
    }
}
