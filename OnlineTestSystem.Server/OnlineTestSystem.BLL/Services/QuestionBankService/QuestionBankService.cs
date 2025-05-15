using OfficeOpenXml;
using OnlineTestSystem.BLL.Services.Base;
using OnlineTestSystem.BLL.ViewModels;
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
                OwnerFullName = bank.Owner.LastName + bank.Owner.FirstName ,
                QuizCategoryId = bank.QuizCategoryId,
                CategoryName = bank.QuizCategory.Name,
                TotalQuestion=bank.Questions.Count,
            });


            return await PaginatedResult<QuestionBankVm>.CreateAsync(banks, pageIndex, pageSize);
        }


        // Read file Excel
        public List<QuestionImportModel> ReadQuestionsFromExcel(Stream fileStream)
        {
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
            var questions = new List<QuestionImportModel>();

            using (var package = new ExcelPackage(fileStream))
            {
                var worksheet = package.Workbook.Worksheets[0]; // lấy sheet đầu tiên
                int rowCount = worksheet.Dimension.Rows;

                for (int row = 2; row <= rowCount; row++) // giả định dòng 1 là header
                {
                    var content = worksheet.Cells[row, 1].Text;  // cột câu hỏi
                    var answerA = worksheet.Cells[row, 2].Text;
                    var answerB = worksheet.Cells[row, 3].Text;
                    var answerC = worksheet.Cells[row, 4].Text;
                    var answerD = worksheet.Cells[row, 5].Text;
                    var correctAnswer = worksheet.Cells[row, 6].Text.Trim().ToUpper();

                    var question = new QuestionImportModel
                    {
                        Content = content,
                        Answers = new List<AnswerImportModel>()
                    };

                    if (!string.IsNullOrEmpty(answerA))
                        question.Answers.Add(new AnswerImportModel { Content = answerA, IsCorrect = (correctAnswer == "A") });
                    if (!string.IsNullOrEmpty(answerB))
                        question.Answers.Add(new AnswerImportModel { Content = answerB, IsCorrect = (correctAnswer == "B") });
                    if (!string.IsNullOrEmpty(answerC))
                        question.Answers.Add(new AnswerImportModel { Content = answerC, IsCorrect = (correctAnswer == "C") });
                    if (!string.IsNullOrEmpty(answerD))
                        question.Answers.Add(new AnswerImportModel { Content = answerD, IsCorrect = (correctAnswer == "D") });

                    questions.Add(question);
                }
            }

            return questions;
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

            foreach (var q in questions)
            {
                var question = new Question
                {
                    Id = Guid.NewGuid(),
                    Content = q.Content,
                    QuestionType =QuestionType.SingleChoice,
                    IsActive = true,
                    Level = QuestionLevel.Medium,
                    BankId = questionBank.Id,
                };

                _unitOfWork.GenericRepository<Question>().Add(question);
                await _unitOfWork.SaveChangesAsync();

                foreach (var a in q.Answers)
                {
                    var answer = new Answer
                    {
                        Id = Guid.NewGuid(),
                        Content = a.Content,
                        IsCorrect = a.IsCorrect,
                        QuestionId = question.Id,
                        IsActive = true,
                    };
                    _unitOfWork.GenericRepository<Answer>().Add(answer);
                }
               
                await _unitOfWork.SaveChangesAsync();
            }

            return questionBank.Id;
        }

    }
}
