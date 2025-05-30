using Microsoft.EntityFrameworkCore;
using OnlineTestSystem.BLL.Services.Base;
using OnlineTestSystem.BLL.ViewModels.UserQuiz;
using OnlineTestSystem.BLL.ViewModels;
using OnlineTestSystem.DAL.Infrastructure;
using OnlineTestSystem.DAL.Models;
using OnlineTestSystem.BLL.ViewModels.Answer;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Spreadsheet;
using DocumentFormat.OpenXml;
using OnlineTestSystem.BLL.Services.MailService;

namespace OnlineTestSystem.BLL.Services.DoQuizService
{
    public class UserQuizService : BaseService<UserQuiz>, IDoQuizService
    {
        // UserQuiz
        private readonly IEmailService _emailService;
        public UserQuizService(IUnitOfWork unitOfWork, IEmailService emailService) : base(unitOfWork)
        {
            _emailService = emailService;
        }

        public async Task<bool> HasUserParticipatedInExamAsync(Guid userId, Guid examId)
        {
            return await _unitOfWork.GenericRepository<UserQuiz>()
                .GetQuery(uq => uq.UserId == userId && uq.ExamId == examId && uq.IsComplete)
                .AnyAsync();
        }

        public async Task<(bool Success, string? ErrorMessage, Guid? UserQuizId)> StartUserQuizAsync(Guid quizId, AddUserQuizVm vm)
        {
            // 1. Kiểm tra ExamParticipant
            var isParticipant = await _unitOfWork.GenericRepository<ExamParticipant>()
                .GetQuery(ep => ep.ExamId == vm.ExamId && ep.UserId == vm.UserId)
                .AnyAsync();

            if (!isParticipant)
                return (false, "Bạn không có quyền tham gia kỳ thi này.", null);

            // 2. Kiểm tra thời gian kỳ thi
            var exam = await _unitOfWork.GenericRepository<Exam>()
                .Get(e => e.Id == vm.ExamId)
                .FirstOrDefaultAsync();

            var now = DateTime.Now;

            if (exam == null)
                return (false, "Kỳ thi không tồn tại.", null);

            if (now < exam.StartTime)
                return (false, "Chưa đến giờ thi. Vui lòng đợi đến giờ để làm bài.", null);

            if (now > exam.EndTime)
                return (false, "Bạn đã hết thời gian làm bài. Không thể tham gia kỳ thi này.", null);

            // 3. Kiểm tra đã làm bài chưa
            var alreadyDone = await _unitOfWork.GenericRepository<UserQuiz>()
                .GetQuery(uq => uq.UserId == vm.UserId && uq.ExamId == vm.ExamId)
                .AnyAsync();

            if (alreadyDone)
                return (false, "Bạn đã tham gia kỳ thi này rồi.", null);

            // 4. Tạo UserQuiz mới
            var userQuiz = new UserQuiz
            {
                Id = Guid.NewGuid(),
                UserId = vm.UserId,
                ExamId = vm.ExamId,
                QuizId = quizId,
                Score = 0,
                IsComplete = false,
                StartedAt = DateTime.Now,
                FinishedAt = DateTime.Now,
            };

            _unitOfWork.GenericRepository<UserQuiz>().Add(userQuiz);
            await _unitOfWork.SaveChangesAsync();

            return (true, null, userQuiz.Id);
        }

        public async Task<PaginatedResult<UserQuizVm>> FilterUserQuizzesAsync(FilterUserQuizVm filterRequest, int pageIndex, int pageSize, string sortBy, string sortOrder)
        {
            var query = _unitOfWork.GenericRepository<UserQuiz>().GetQuery();

            if (filterRequest.UserId.HasValue)
                query = query.Where(q => q.UserId == filterRequest.UserId);

            if (!string.IsNullOrEmpty(filterRequest.StudentCode))
            {
                query = query.Where(q => q.User != null && q.User.StudentCode.Contains(filterRequest.StudentCode));
            }

            if (!string.IsNullOrEmpty(filterRequest.FullName))
            {
                query = query.Where(q => q.User != null && q.User.FirstName.Contains(filterRequest.FullName) || q.User.LastName.Contains(filterRequest.FullName));
            }

            if (filterRequest.ExamId.HasValue)
                query = query.Where(q => q.ExamId == filterRequest.ExamId);

            if (!string.IsNullOrEmpty(filterRequest.ExamName))
                query = query.Where(q => q.Exam != null && q.Exam.Name.Contains(filterRequest.ExamName));

            if (filterRequest.QuizId.HasValue)
                query = query.Where(q => q.QuizId == filterRequest.QuizId);

            if (!string.IsNullOrEmpty(filterRequest.QuizName))
                query = query.Where(q => q.Quiz != null && q.Quiz.Title.Contains(filterRequest.QuizName));

            if (filterRequest.StartDate.HasValue)
                query = query.Where(q => q.StartedAt >= filterRequest.StartDate);

            if (filterRequest.EndDate.HasValue)
                query = query.Where(q => q.StartedAt <= filterRequest.EndDate);

            if (filterRequest.Score.HasValue)
                query = query.Where(q => q.Score >= filterRequest.Score);

            if (filterRequest.IsCompleted)
                query = query.Where(q => q.IsComplete == filterRequest.IsCompleted);

            query = query.Include(q => q.Quiz)
                         .Include(q => q.Exam)
                         .Include(q => q.User);

            if (!string.IsNullOrEmpty(sortBy))
            {
                if (sortOrder.ToLower() == "asc")
                    query = query.OrderByDynamic(sortBy, true);
                else
                    query = query.OrderByDynamic(sortBy, false);
            }

            var resultQuery = query.Select(q => new UserQuizVm
            {
                Id = q.Id,
                UserId = q.UserId,
                StudentCode = q.User.StudentCode,
                FirstName = q.User.FirstName,
                LastName = q.User.LastName,
                ExamId = q.ExamId,
                ExamName = q.Exam != null ? q.Exam.Name : "",
                QuizId = q.QuizId,
                QuizName = q.Quiz != null ? q.Quiz.Title : "",
                StartedAt = q.StartedAt,
                FinishedAt = q.FinishedAt,
                Score = q.Score,
                IsComplete = q.IsComplete
            });

            return await PaginatedResult<UserQuizVm>.CreateAsync(resultQuery, pageIndex, pageSize);
        }

        public async Task<bool> SubmitUserQuizAndCalculateScoreAsync(Guid userQuizId, float? submittedScore = null)
        {
            // 1. Lấy bài làm UserQuiz
            var userQuiz = await _unitOfWork.GenericRepository<UserQuiz>()
                     .Get(q => q.Id == userQuizId)
                     .Include(q => q.Quiz)
                         .ThenInclude(quiz => quiz.QuizQuestions)
                     .FirstOrDefaultAsync();


            if (userQuiz == null)
                return false;

            // 2. Lấy tất cả câu trả lời UserAnswer của bài làm này
            var userAnswers = await _unitOfWork.GenericRepository<UserAnswer>()
                    .GetQuery(ua => ua.UserQuizId == userQuizId)
                    .Include(ua => ua.Answer)
                    .Include(ua => ua.Question)
                    .ToListAsync();

            // 3. Tính tổng điểm dựa trên câu trả lời đúng
            float totalScore = 0;

            // Giả sử mỗi câu hỏi có điểm riêng (QuizQuestion.Score), cần lấy điểm câu hỏi tương ứng
            foreach (var userAnswer in userAnswers)
            {
                if (userAnswer.Answer != null && userAnswer.Answer.IsCorrect)
                {
                    // Tìm QuizQuestion đúng với QuestionId trong Quiz của UserQuiz
                    var quizQuestion = userQuiz.Quiz.QuizQuestions
                        .FirstOrDefault(qq => qq.QuestionId == userAnswer.QuestionId);

                    var questionScore = quizQuestion?.Score ?? 0;
                    totalScore += (float)questionScore;
                }
            }

            // 4. Cập nhật điểm và trạng thái hoàn thành bài làm
            userQuiz.Score = submittedScore ?? totalScore; // Nếu có điểm do client gửi thì ưu tiên, không thì tính tự động
            userQuiz.FinishedAt = DateTime.Now;
            userQuiz.IsComplete = true;

            _unitOfWork.GenericRepository<UserQuiz>().Update(userQuiz);
            await _unitOfWork.SaveChangesAsync();

            var quizDetail = await GetUserQuizDetailAsync(userQuizId);

            if (quizDetail != null && !string.IsNullOrEmpty(quizDetail.UserId.ToString()))
            {
                var userEmail = userQuiz.User?.Email;
                if (!string.IsNullOrEmpty(userEmail))
                {
                    var excelBytes = await ExportUserQuizByUserToExcelAsync(userQuiz.ExamId.Value, userQuiz.UserId);

                    await _emailService.SendUserQuizResultAsync(userEmail, $"{quizDetail.FullName}", quizDetail, excelBytes);
                }
            }

            return true;
        }

        public async Task<UserQuizDetailVm?> GetUserQuizDetailAsync(Guid userQuizId)
        {
            var userQuiz = await _unitOfWork.GenericRepository<UserQuiz>()
                                            .Get(uq => uq.Id == userQuizId,
                                                  includesProperties: "Quiz.QuizQuestions.Question.Answers,UserAnswers,User,Exam")
                                            .FirstOrDefaultAsync();

            if (userQuiz == null) return null;

            var quiz = userQuiz.Quiz;
            if (quiz == null)
                throw new Exception("Quiz not found for this UserQuiz");

            var quizQuestions = quiz.QuizQuestions ?? new List<QuizQuestion>();
            var userAnswers = userQuiz.UserAnswers ?? new List<UserAnswer>();
            var user = userQuiz.User ?? throw new Exception("User not found for this UserQuiz");
            var exam = userQuiz.Exam ?? new Exam(); // hoặc bỏ qua nếu không cần thiết

            var questions = quizQuestions
                .OrderBy(qq => qq.Order)
                .Select(qq =>
                {
                    var q = qq.Question;
                    if (q == null) return null; // bỏ qua câu hỏi null

                    var chosenAnswerIds = userAnswers
                        .Where(ua => ua.QuestionId == q.Id && ua.AnswerId != null)
                        .Select(ua => ua.AnswerId.Value)
                        .ToList();

                    return new UserQuizQuestionDetailVm
                    {
                        QuestionId = q.Id,
                        Content = q.Content,
                        Order = qq.Order,
                        Score = qq.Score,
                        QuestionType = q.QuestionType.ToString(),
                        Level = q.Level.ToString(),
                        IsActive = q.IsActive,
                        Answers = (q.Answers ?? new List<Answer>())
                            .OrderBy(a => a.Order)
                            .Select(a => new AnswerVm
                            {
                                Id = a.Id,
                                Content = a.Content,
                                Order = a.Order,
                                IsCorrect = a.IsCorrect,
                                IsActive = a.IsActive,
                                QuestionId = a.QuestionId
                            }).ToList(),
                        UserChosenAnswerIds = chosenAnswerIds
                    };
                })
                .Where(q => q != null)
                .ToList();

            return new UserQuizDetailVm
            {
                UserQuizId = userQuiz.Id,
                UserId = userQuiz.User.Id,
                StudentCode = userQuiz.User.StudentCode,
                FullName = $"{user.LastName} {user.FirstName}",
                ExamId = userQuiz.ExamId,
                ExamName = exam?.Name ?? "",
                QuizId = quiz.Id,
                QuizName = quiz.Title,
                Duration = quiz.Duration,
                Score = userQuiz.Score,
                StartedAt = userQuiz.StartedAt,
                FinishedAt = userQuiz.FinishedAt,
                IsComplete = userQuiz.IsComplete,
                Questions = questions
            };
        }

        public async Task<DoingUserQuizVm?> GetDoingUserQuizAsync(Guid examId, Guid userId)
        {
            var now = DateTime.Now; 

            var userQuiz = await _unitOfWork.GenericRepository<UserQuiz>()
                .GetQuery(uq => uq.ExamId == examId && uq.UserId == userId && !uq.IsComplete)
                .Include(uq => uq.Quiz)
                    .ThenInclude(q => q.QuizQuestions)
                        .ThenInclude(qq => qq.Question)
                            .ThenInclude(q => q.Answers)
                .Include(uq => uq.UserAnswers)
                .FirstOrDefaultAsync();

            if (userQuiz == null)
                return null;

            var duration = userQuiz.Quiz?.Duration ?? 0;
            var timePassed = (now - userQuiz.StartedAt).TotalSeconds;
            var total = duration * 60; // Nếu Duration là phút, đổi sang giây
            var timeLeft = Math.Max(0, total - timePassed);

            var isTimeOver = timeLeft <= 0;

            // Nếu đã hết giờ, có thể trả về null hoặc trả về với isTimeOver = true
            if (isTimeOver)
                return null;

            // Map question + đáp án đã chọn
            var userAnswers = userQuiz.UserAnswers ?? new List<UserAnswer>();

            var questions = userQuiz.Quiz.QuizQuestions
                .OrderBy(qq => qq.Order)
                .Select(qq => {
                    var q = qq.Question;
                    if (q == null) return null;

                    var chosenAnswerIds = userAnswers
                        .Where(ua => ua.QuestionId == q.Id && ua.AnswerId != null)
                        .Select(ua => ua.AnswerId.Value)
                        .ToList();

                    return new UserQuizQuestionDetailVm
                    {
                        QuestionId = q.Id,
                        Content = q.Content,
                        Order = qq.Order,
                        Score = qq.Score,
                        QuestionType = q.QuestionType.ToString(),
                        Level = q.Level.ToString(),
                        IsActive = q.IsActive,
                        Answers = (q.Answers ?? new List<Answer>())
                            .OrderBy(a => a.Order)
                            .Select(a => new AnswerVm
                            {
                                Id = a.Id,
                                Content = a.Content,
                                Order = a.Order,
                                IsCorrect = a.IsCorrect,
                                IsActive = a.IsActive,
                                QuestionId = a.QuestionId
                            }).ToList(),
                        UserChosenAnswerIds = chosenAnswerIds
                    };
                })
                .Where(q => q != null)
                .ToList();

            return new DoingUserQuizVm
            {
                UserQuizId = userQuiz.Id,
                UserId = userQuiz.UserId,
                ExamId = userQuiz.ExamId,
                QuizId = userQuiz.QuizId,
                StartedAt = userQuiz.StartedAt,
                RemainingTime = timeLeft,
                IsTimeOver = false,
                Questions = questions
            };
        }

        // export list result 
        public async Task<byte[]> ExportUserQuizToExcelAsync(Guid examId)
        {
            var exam = await _unitOfWork.GenericRepository<Exam>().GetQuery(e => e.Id == examId).FirstOrDefaultAsync();
            var results = await _unitOfWork.GenericRepository<UserQuiz>()
                .GetQuery(uq => uq.ExamId == examId)
                .Include(uq => uq.User).Include(uq => uq.Quiz)
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
                Sheet sheet = new Sheet() { Id = document.WorkbookPart.GetIdOfPart(worksheetPart), SheetId = 1, Name = "BangDiem" };
                sheets.Append(sheet);

                WorkbookStylesPart stylesPart = workbookPart.AddNewPart<WorkbookStylesPart>();
                stylesPart.Stylesheet = GenerateBeautifulStylesheet();
                stylesPart.Stylesheet.Save();

                // Merge cells for big title
                MergeCells mergeCells = new MergeCells();
                mergeCells.Append(new MergeCell() { Reference = new StringValue("A1:H1") });
                worksheetPart.Worksheet.InsertAfter(mergeCells, worksheetPart.Worksheet.Elements<SheetData>().First());

                // Row 1: Big title (merge B1:I1, center, bold, font size lớn)
                var titleRow = new Row() { RowIndex = 1 };
                titleRow.Append(CreateCell("BẢNG ĐIỂM KỲ THI", CellValues.String, 2, "A1"));
                sheetData.Append(titleRow);

                // Row 2-5: Info (label bold left, value normal right)
                sheetData.Append(CreateInfoRow("Tên kỳ thi:", exam.Name, 2));
                sheetData.Append(CreateInfoRow("Mô tả:", exam.Description, 3));
                sheetData.Append(CreateInfoRow("Thời gian bắt đầu:", exam.StartTime.ToString("dd/MM/yyyy HH:mm"), 4));
                sheetData.Append(CreateInfoRow("Thời gian kết thúc:", exam.EndTime.HasValue ? exam.EndTime.Value.ToString("dd/MM/yyyy HH:mm") : "", 5));

                // Blank row
                sheetData.Append(new Row());

                // Header row (bold, border, background gray)
                var headerRow = new Row();
                headerRow.Append(
                    CreateCell("STT", CellValues.String, 6),
                    CreateCell("Mã SV", CellValues.String, 6),
                    CreateCell("Họ và tên", CellValues.String, 6),
                    CreateCell("Đề thi", CellValues.String, 6),
                    CreateCell("Thời gian bắt đầu", CellValues.String, 6),
                    CreateCell("Thời gian nộp bài", CellValues.String, 6),
                    CreateCell("Điểm", CellValues.String, 6),
                    CreateCell("Ghi chú", CellValues.String, 6)
                );
                sheetData.Append(headerRow);

                // Data rows (borders, căn chỉnh hợp lý)
                var sortedResults = results
                                    .OrderBy(r => r.User?.FirstName ?? "")
                                    .ThenBy(r => r.User?.LastName ?? "")
                                    .ToList();

                int stt = 1;
                foreach (var r in results)
                {
                    var user = r.User;
                    var quiz = r.Quiz;
                    sheetData.Append(
                        new Row(

                            CreateCell(stt.ToString(), CellValues.Number, 5),
                            CreateCell(user?.StudentCode ?? "", CellValues.String, 5),
                            CreateCell($"{user?.LastName ?? ""} {user?.FirstName ?? ""}", CellValues.String, 7),
                            CreateCell(quiz?.Title ?? "", CellValues.String, 7),
                            CreateCell(r.StartedAt.ToString("dd/MM/yyyy HH:mm "), CellValues.String, 5),
                            CreateCell(r.FinishedAt.ToString("dd/MM/yyyy HH:mm"), CellValues.String, 5),
                            CreateCell(((double)r.Score).ToString("0.##"), CellValues.Number, 5),
                            CreateCell("", CellValues.String, 4)
                        )
                    );
                    stt++;
                }

                // Set column width (auto-fit style, hoặc set cố định)
                Columns columns = new Columns(
                    new Column() { Min = 2, Max = 2, Width = 12, CustomWidth = true }, // Student code
                    new Column() { Min = 3, Max = 3, Width = 25, CustomWidth = true }, // Full name
                    new Column() { Min = 4, Max = 4, Width = 25, CustomWidth = true }, // Quiz
                    new Column() { Min = 5, Max = 5, Width = 18, CustomWidth = true }, // Start
                    new Column() { Min = 6, Max = 6, Width = 18, CustomWidth = true }, // End
                    new Column() { Min = 7, Max = 7, Width = 10, CustomWidth = true }, // Score
                    new Column() { Min = 8, Max = 8, Width = 20, CustomWidth = true }  // Note
                );
                worksheetPart.Worksheet.InsertAt(columns, 0);

                worksheetPart.Worksheet.Save();
            }
            return ms.ToArray();
        }

        // export list result by userID
        public async Task<byte[]> ExportUserQuizByUserToExcelAsync(Guid examId,Guid userId)
        {
            var exam = await _unitOfWork.GenericRepository<Exam>().GetQuery(e => e.Id == examId).FirstOrDefaultAsync();

            var userQuiz = await _unitOfWork.GenericRepository<UserQuiz>()
         .GetQuery(uq => uq.ExamId == examId && uq.UserId == userId)
         .Include(uq => uq.UserAnswers)
         .Include(uq => uq.Quiz)
             .ThenInclude(q => q.QuizQuestions)
                 .ThenInclude(qq => qq.Question)
                     .ThenInclude(q => q.Answers)
         .Include(uq => uq.User)
         .FirstOrDefaultAsync();

            using var ms = new MemoryStream();
            using (SpreadsheetDocument document = SpreadsheetDocument.Create(ms, SpreadsheetDocumentType.Workbook))
            {
                WorkbookPart workbookPart = document.AddWorkbookPart();
                workbookPart.Workbook = new Workbook();
                WorksheetPart worksheetPart = workbookPart.AddNewPart<WorksheetPart>();
                var sheetData = new SheetData();
                worksheetPart.Worksheet = new Worksheet(sheetData);

                Sheets sheets = document.WorkbookPart.Workbook.AppendChild(new Sheets());
                Sheet sheet = new Sheet() { Id = document.WorkbookPart.GetIdOfPart(worksheetPart), SheetId = 1, Name = "BangDiemSinhVien" };
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
                titleRow.Append(CreateCell("BẢNG ĐIỂM SINH VIÊN", CellValues.String, 2, "A1"));
                sheetData.Append(titleRow);

                // Row 2-5: Info (label bold left, value normal right)
                sheetData.Append(CreateInfoRow("Kỳ thi:", exam?.Name, 2));
                sheetData.Append(CreateInfoRow("Đề thi:", userQuiz?.Quiz.Title, 3));
                sheetData.Append(CreateInfoRow("Họ và tên:", userQuiz?.User?.LastName +" "+ userQuiz?.User?.FirstName, 4));
                sheetData.Append(CreateInfoRow("Mã SV:", userQuiz?.User?.StudentCode, 5));
                sheetData.Append(CreateInfoRow("Thời gian bắt đầu:", userQuiz?.StartedAt.ToString("dd/MM/yyyy HH:mm") ?? "", 6));
                sheetData.Append(CreateInfoRow("Thời gian nộp bài:",  userQuiz?.FinishedAt.ToString("dd/MM/yyyy HH:mm") ?? "", 7));
                sheetData.Append(CreateInfoRow("Tổng điểm:", (userQuiz?.Score ?? 0).ToString("0.##"), 8));

                // Blank row
                sheetData.Append(new Row());

                // Header row (bold, border, background gray)
                var headerRow = new Row();
                headerRow.Append(
                    CreateCell("Câu", CellValues.String, 6),
                    CreateCell("Nội dung câu hỏi", CellValues.String, 6),
                    CreateCell("Đáp án đúng", CellValues.String, 6),
                    CreateCell("Câu trả lời của bạn", CellValues.String, 6),
                    CreateCell("Đúng/Sai", CellValues.String, 6)
                );
                sheetData.Append(headerRow);

                // Data rows (borders, căn chỉnh hợp lý)
                int stt = 1;
                foreach (var qq in userQuiz.Quiz.QuizQuestions.OrderBy(qq => qq.Order))
                {
                    var question = qq.Question;
                    if (question == null) continue;

                    var correctAnswers = question.Answers?.Where(a => a.IsCorrect).Select(a => a.Content).ToList() ?? new List<string>();
                    var correctAnswersString = await _unitOfWork.GenericRepository<Answer>()
                        .GetQuery(a => a.QuestionId == question.Id && a.IsCorrect)
                        .Select(a => a.Content)
                        .FirstOrDefaultAsync();

                    var userAnswers = userQuiz.UserAnswers?
                 .Where(ua => ua.QuestionId == question.Id && ua.AnswerId != null)
                 .Select(ua => ua.Answer?.Content ?? ua.AnswerText ?? "")
                 .ToList() ?? new List<string>();

                    var userAnswerString = await _unitOfWork.GenericRepository<UserAnswer>()
                        .GetQuery(ua => ua.UserQuizId == userQuiz.Id && ua.QuestionId == question.Id)
                        .Select(ua => ua.Answer.Content)
                        .FirstOrDefaultAsync();

                    bool isCorrect = false;

                    if (correctAnswers.Count == userAnswers.Count && !correctAnswers.Except(userAnswers).Any())
                    {
                        isCorrect = true;
                    }


                    sheetData.Append(
                        new Row(

                            CreateCell(stt.ToString(), CellValues.Number, 5, alignment: HorizontalAlignmentValues.Center),
                            CreateCell(question?.Content?.ToString(), CellValues.String, 7, alignment: HorizontalAlignmentValues.Center),
                            CreateCell(correctAnswersString?.ToString(), CellValues.String, 7),
                            CreateCell(userAnswerString?.ToString(), CellValues.String, 7, alignment: HorizontalAlignmentValues.Center),
                            CreateCell(isCorrect ? "Đúng" : "Sai", CellValues.String, 5, alignment: HorizontalAlignmentValues.Center)
                        )
                    );
                    stt++;
                }

                // Set column width (auto-fit style, hoặc set cố định)
                Columns columns = new Columns(
                    new Column() { Min = 2, Max = 2, Width = 30, CustomWidth = true }, 
                    new Column() { Min = 3, Max = 3, Width = 30, CustomWidth = true }, 
                    new Column() { Min = 4, Max = 4, Width = 30, CustomWidth = true }, 
                    new Column() { Min = 5, Max = 5, Width = 18, CustomWidth = true }
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
                        Alignment = new Alignment { Vertical = VerticalAlignmentValues.Center } // center 
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

    // UserAnswer
    public class UserAnswerService : BaseService<UserAnswer>, IUserAnswerService
    {

        public UserAnswerService(IUnitOfWork unitOfWork) : base(unitOfWork)
        {
        }

        public async Task<bool> AddOrUpdateUserAnswerAsync(Guid userQuizId, AddUserAnswerVm vm)
        {
            var existingAnswer = await _unitOfWork.GenericRepository<UserAnswer>()
                .GetQuery(ua => ua.UserQuizId == userQuizId && ua.QuestionId == vm.QuestionId)
                .FirstOrDefaultAsync();

            // Lấy đáp án đúng từ DB để so sánh
            var correctAnswer = await _unitOfWork.GenericRepository<Answer>()
                .GetQuery(a => a.Id == vm.AnswerId && a.IsCorrect)
                .FirstOrDefaultAsync();

            bool isCorrect = (correctAnswer != null);

            if (existingAnswer == null)
            {
                var newUserAnswer = new UserAnswer
                {
                    Id = Guid.NewGuid(),
                    UserQuizId = userQuizId,
                    QuestionId = vm.QuestionId,
                    AnswerId = vm.AnswerId,
                    AnswerText = vm.AnswerText,
                    UserVoiceUrl = vm.UserVoiceUrl,
                    IsCorrect = isCorrect
                };
                _unitOfWork.GenericRepository<UserAnswer>().Add(newUserAnswer);
            }
            else
            {
                existingAnswer.AnswerId = vm.AnswerId;
                existingAnswer.AnswerText = vm.AnswerText;
                existingAnswer.UserVoiceUrl = vm.UserVoiceUrl;
                existingAnswer.IsCorrect = isCorrect;
                _unitOfWork.GenericRepository<UserAnswer>().Update(existingAnswer);
            }

            await _unitOfWork.SaveChangesAsync();
            return true;
        }
    }
}
