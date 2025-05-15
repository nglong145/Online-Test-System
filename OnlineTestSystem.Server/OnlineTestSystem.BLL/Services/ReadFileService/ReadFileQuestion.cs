using OfficeOpenXml;
using OnlineTestSystem.BLL.ViewModels.UploadFile;
using OnlineTestSystem.DAL.Models;
using Xceed.Words.NET;

namespace OnlineTestSystem.BLL.Services.ReadFileService
{
    public class ReadFileQuestion
    {
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


        public List<QuestionImportModel> ReadQuestionsFromWord(Stream fileStream)
        {
            var questions = new List<QuestionImportModel>();
            using var ms = new MemoryStream();
            fileStream.CopyTo(ms);
            ms.Position = 0;

            using var document = DocX.Load(ms);
            var paragraphs = document.Paragraphs;

            QuestionImportModel currentQuestion = null;

            foreach (var para in paragraphs)
            {
                string text = para.Text.Trim();

                if (text.StartsWith("Câu "))  
                {
                    if (currentQuestion != null)
                    {
                        questions.Add(currentQuestion);
                    }
                    currentQuestion = new QuestionImportModel
                    {
                        Content = text.Substring(text.IndexOf(':') + 1).Trim(),
                        Answers = new List<AnswerImportModel>()
                    };
                }
                else if (text.StartsWith("A.") || text.StartsWith("B.") || text.StartsWith("C.") || text.StartsWith("D."))
                {
                    if (currentQuestion != null)
                    {
                        string answerText = text.Substring(2).Trim();
                        currentQuestion.Answers.Add(new AnswerImportModel { Content = answerText, IsCorrect = false });
                    }
                }
                else if (text.StartsWith("Đáp án đúng:"))
                {
                    if (currentQuestion != null)
                    {
                        string correctLetter = text.Substring("Đáp án đúng:".Length).Trim();
                        foreach (var ans in currentQuestion.Answers)
                        {
                            if (ans.Content.StartsWith(correctLetter))
                            {
                                ans.IsCorrect = true;
                                break;
                            }
                        }
                    }
                }
            }
            if (currentQuestion != null)
            {
                questions.Add(currentQuestion);
            }

            return questions;
        }
    }
}
