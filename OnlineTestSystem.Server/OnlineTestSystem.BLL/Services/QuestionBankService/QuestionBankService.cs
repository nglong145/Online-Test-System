using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Spreadsheet;
using Microsoft.EntityFrameworkCore;
using OnlineTestSystem.BLL.Services.Base;
using OnlineTestSystem.BLL.ViewModels;
using OnlineTestSystem.BLL.ViewModels.Answer;
using OnlineTestSystem.BLL.ViewModels.Question;
using OnlineTestSystem.BLL.ViewModels.QuestionBank;
using OnlineTestSystem.BLL.ViewModels.UploadFile;
using OnlineTestSystem.DAL.Infrastructure;
using OnlineTestSystem.DAL.Models;
using Xceed.Words.NET;

namespace OnlineTestSystem.BLL.Services.QuestionBankService
{
    public class QuestionBankService : BaseService<QuestionBank>, IQuestionBankService
    {
        public QuestionBankService(IUnitOfWork unitOfWork) : base(unitOfWork)
        {
        }

        public async Task<PaginatedResult<QuestionBankVm>> FilterBanksAsync(FilterBankVm filterRequest,
                                                               int pageIndex,
                                                               int pageSize,
                                                               string sortBy,
                                                               string sortOrder)
        {
            var query = _unitOfWork.GenericRepository<QuestionBank>().GetQuery();


            if (!string.IsNullOrEmpty(filterRequest.Name))
            {
                query = query.Where(b => b.Name.Contains(filterRequest.Name));
            }

            if (filterRequest.OwnerId.HasValue)
                query = query.Where(b => b.OwnerId == filterRequest.OwnerId);

            if (!string.IsNullOrEmpty(filterRequest.OwnerFullName))
            {
                query = query.Where(b => b.Owner.FirstName.Contains(filterRequest.OwnerFullName) || b.Owner.LastName.Contains(filterRequest.OwnerFullName));
            }

            if (filterRequest.QuizCategoryId.HasValue)
                query = query.Where(b => b.QuizCategoryId == filterRequest.QuizCategoryId);

            if (!string.IsNullOrEmpty(filterRequest.CategoryName))
            {
                query = query.Where(b => b.QuizCategory.Name.Contains(filterRequest.CategoryName));
            }

            if (filterRequest.IsActive.HasValue)
                query = query.Where(b => b.IsActive == filterRequest.IsActive);


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

            var banks = query.Select(bank => new QuestionBankVm
            {
                Id = bank.Id,
                Name = bank.Name,
                OwnerId = bank.OwnerId,
                OwnerFullName = bank.Owner.LastName +" "+ bank.Owner.FirstName ,
                QuizCategoryId = bank.QuizCategoryId,
                CategoryName = bank.QuizCategory.Name,
                TotalQuestion=bank.Questions.Count,
            });


            return await PaginatedResult<QuestionBankVm>.CreateAsync(banks, pageIndex, pageSize);
        }


        // Get detail with questions includes answers
        public async Task<QuestionBankWithDetailVm?> GetBankFullDetailAsync(Guid bankId)
        {
            var bank = await _unitOfWork.GenericRepository<QuestionBank>()
                .Get(q => q.Id == bankId, includesProperties: "Owner,QuizCategory,Questions.Answers")
                .FirstOrDefaultAsync();

            if (bank == null)
                return null;

            return new QuestionBankWithDetailVm
            {
                Id = bank.Id,
                Name = bank.Name,
                QuizCategoryId = bank.QuizCategoryId,
                CategoryName = bank.QuizCategory?.Name,
                OwnerId = bank.OwnerId,
                OwnerFullName = bank.Owner?.LastName + " " + bank.Owner?.FirstName,
                Questions = bank.Questions?.OrderBy(q => q.Order).Select(q => new QuestionWithAnswersVm
                {
                    Id = q.Id,
                    Content = q.Content,
                    Order=q.Order,
                    QuestionType = q.QuestionType.ToString(),
                    Level = q.Level.ToString(),
                    IsActive = q.IsActive,
                    Answers = q.Answers? .OrderBy(q => q.Order).Select(a => new AnswerVm
                    {
                        Id = a.Id,
                        Content = a.Content,
                        Order = a.Order,
                        IsCorrect = a.IsCorrect,
                        QuestionId= a.QuestionId,
                    }).ToList() ?? new List<AnswerVm>()
                }).ToList() ?? new List<QuestionWithAnswersVm>()
            };
        }


        // Read file Excel
        public List<QuestionImportModel> ReadQuestionsFromExcel(Stream fileStream)
        {
            var questions = new List<QuestionImportModel>();

            using var ms = new MemoryStream();
            fileStream.CopyTo(ms);
            ms.Position = 0;

            using SpreadsheetDocument document = SpreadsheetDocument.Open(ms, false);
            WorkbookPart workbookPart = document.WorkbookPart;
            Sheet sheet = workbookPart.Workbook.Sheets.GetFirstChild<Sheet>();
            WorksheetPart worksheetPart = (WorksheetPart)workbookPart.GetPartById(sheet.Id);
            SheetData sheetData = worksheetPart.Worksheet.GetFirstChild<SheetData>();

            SharedStringTablePart sharedStringPart = workbookPart.GetPartsOfType<SharedStringTablePart>().FirstOrDefault();
            SharedStringTable sharedStringTable = sharedStringPart?.SharedStringTable;

            var rows = sheetData.Elements<Row>().Skip(1); // Bỏ qua header

            foreach (Row row in rows)
            {
                string GetCellText(string columnName)
                {
                    var cell = row.Elements<Cell>().FirstOrDefault(c => string.Compare(GetColumnName(c.CellReference), columnName, true) == 0);
                    if (cell == null) return string.Empty;

                    if (cell.DataType != null && cell.DataType == CellValues.SharedString)
                    {
                        int ssid = int.Parse(cell.CellValue.Text);
                        return sharedStringTable.ElementAt(ssid).InnerText.Trim();
                    }
                    else
                    {
                        return cell.CellValue?.Text?.Trim() ?? string.Empty;
                    }
                }

                // Cột B là câu hỏi
                string content = GetCellText("B");

                // Cột C-F là đáp án A-D
                string answerA = GetCellText("C");
                string answerB = GetCellText("D");
                string answerC = GetCellText("E");
                string answerD = GetCellText("F");

                // Cột G là đáp án đúng
                string correctAnswer = GetCellText("G").ToUpper();

                if (string.IsNullOrWhiteSpace(content))
                    continue;

                var question = new QuestionImportModel
                {
                    Content = content,
                    Answers = new List<AnswerImportModel>()
                };

                if (!string.IsNullOrWhiteSpace(answerA))
                    question.Answers.Add(new AnswerImportModel { Option = "A", Content = answerA, IsCorrect = (correctAnswer == "A") });
                if (!string.IsNullOrWhiteSpace(answerB))
                    question.Answers.Add(new AnswerImportModel { Option = "B", Content = answerB, IsCorrect = (correctAnswer == "B") });
                if (!string.IsNullOrWhiteSpace(answerC))
                    question.Answers.Add(new AnswerImportModel { Option = "C", Content = answerC, IsCorrect = (correctAnswer == "C") });
                if (!string.IsNullOrWhiteSpace(answerD))
                    question.Answers.Add(new AnswerImportModel { Option = "D", Content = answerD, IsCorrect = (correctAnswer == "D") });

                questions.Add(question);
            }

            return questions;
        }

        // Hàm helper lấy tên cột từ CellReference, ví dụ "A1" => "A"
        private string GetColumnName(string cellReference)
        {
            string columnName = string.Empty;
            foreach (char ch in cellReference)
            {
                if (char.IsLetter(ch))
                    columnName += ch;
                else
                    break;
            }
            return columnName;
        }


        // Read file Docx
        public List<QuestionImportModel> ReadQuestionsFromWord(Stream fileStream)
        {
            var questions = new List<QuestionImportModel>();

            using var ms = new MemoryStream();
            fileStream.CopyTo(ms);
            ms.Position = 0;

            using var document = DocX.Load(ms);
            var allText = string.Join("\n", document.Paragraphs.Select(p => p.Text));
            var lines = allText.Split(new[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries);

            QuestionImportModel currentQuestion = null;
            List<AnswerImportModel> tempAnswers = null;
            bool readingAnswers = false;

            foreach (var line in lines)
            {
                var text = line.Trim();

                if (text.StartsWith("Câu "))
                {
                    if (currentQuestion != null)
                    {
                        currentQuestion.Answers = tempAnswers ?? new List<AnswerImportModel>();
                        questions.Add(currentQuestion);
                    }

                    int colonIndex = text.IndexOf(':');
                    string questionContent = colonIndex >= 0 ? text.Substring(colonIndex + 1).Trim() : text;

                    currentQuestion = new QuestionImportModel
                    {
                        Content = questionContent,
                    };

                    tempAnswers = new List<AnswerImportModel>();
                    readingAnswers = false;
                }
                else if (!readingAnswers && currentQuestion != null &&
                         !text.StartsWith("A.") && !text.StartsWith("B.") && !text.StartsWith("C.") && !text.StartsWith("D.") &&
                         !text.StartsWith("Đáp án đúng:") && !string.IsNullOrEmpty(text))
                {
                    currentQuestion.Content += "\n" + text;
                }
                else if ((text.StartsWith("A.") || text.StartsWith("B.") || text.StartsWith("C.") || text.StartsWith("D.")) && currentQuestion != null)
                {
                    readingAnswers = true;

                    string option = text.Substring(0, 1);
                    string answerText = text.Substring(2).Trim();
                    tempAnswers.Add(new AnswerImportModel { Option = option, Content = answerText, IsCorrect = false });
                }
                else if (text.StartsWith("Đáp án đúng:") && currentQuestion != null)
                {
                    string correctLetter = text.Substring("Đáp án đúng:".Length).Trim();
                    foreach (var ans in tempAnswers)
                    {
                        if (ans.Option == correctLetter)
                        {
                            ans.IsCorrect = true;
                            break;
                        }
                    }
                }
            }

            if (currentQuestion != null)
            {
                currentQuestion.Answers = tempAnswers ?? new List<AnswerImportModel>();
                questions.Add(currentQuestion);
            }

            return questions;
        }


        // Upload 
        public async Task<Guid> ImportFromFileAsync(Stream fileStream, string fileName, AddQuestionBankVm bankVm)
        {
            var extension = Path.GetExtension(fileName).ToLower();
            List<QuestionImportModel> questions;

            if (extension == ".xlsx" || extension == ".xls")
            {
                questions = ReadQuestionsFromExcel(fileStream);
            }
            else if (extension == ".docx")
            {
                questions = ReadQuestionsFromWord(fileStream);
            }
            else
            {
                throw new ArgumentException("Unsupported file type");
            }

            var questionBank = new QuestionBank
            {
                Id = Guid.NewGuid(),
                Name = bankVm.Name,
                OwnerId = bankVm.OwnerId,
                QuizCategoryId = bankVm.QuizCategoryId
            };

            _unitOfWork.GenericRepository<QuestionBank>().Add(questionBank);
            await _unitOfWork.SaveChangesAsync();

            for (int qIndex = 0; qIndex < questions.Count; qIndex++)
            {
                var q = questions[qIndex];

                var question = new Question
                {
                    Id = Guid.NewGuid(),
                    Content = q.Content,
                    QuestionType = QuestionType.SingleChoice,
                    IsActive = true,
                    Level = QuestionLevel.Medium,
                    BankId = questionBank.Id,
                    Order = q.Order > 0 ? q.Order : (qIndex + 1)  // Ưu tiên Order import, nếu không có thì tự tăng
                };

                _unitOfWork.GenericRepository<Question>().Add(question);
                await _unitOfWork.SaveChangesAsync();

                // Gán Order cho từng Answer
                for (int aIndex = 0; aIndex < q.Answers.Count; aIndex++)
                {
                    var a = q.Answers[aIndex];
                    var answer = new Answer
                    {
                        Id = Guid.NewGuid(),
                        Content = a.Content,
                        IsCorrect = a.IsCorrect,
                        QuestionId = question.Id,
                        IsActive = true,
                        Order = a.Order > 0 ? a.Order : (aIndex + 1) // Ưu tiên Order import, nếu không có thì tự tăng
                    };
                    _unitOfWork.GenericRepository<Answer>().Add(answer);
                }
                await _unitOfWork.SaveChangesAsync();
            }

            return questionBank.Id;
        }

    }
}
