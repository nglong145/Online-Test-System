using OnlineTestSystem.BLL.ViewModels.UserQuiz;

namespace OnlineTestSystem.BLL.Services.MailService
{
    public interface IEmailService
    {
        Task SendUserQuizResultAsync(string toEmail, string fullName, UserQuizDetailVm quizDetail, byte[] excelFileBytes);
    }
}
