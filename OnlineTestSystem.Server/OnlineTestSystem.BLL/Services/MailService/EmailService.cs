using Microsoft.Extensions.Configuration;
using OnlineTestSystem.BLL.ViewModels.UserQuiz;
using System.Net.Mail;
using System.Net;

namespace OnlineTestSystem.BLL.Services.MailService
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        public EmailService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task SendUserQuizResultAsync(string toEmail, string fullName, UserQuizDetailVm quizDetail, byte[] excelFileBytes)
        {
            var smtpHost = _configuration["Smtp:Host"];
            var smtpPort = int.Parse(_configuration["Smtp:Port"]);
            var smtpUser = _configuration["Smtp:User"];
            var smtpPass = _configuration["Smtp:Pass"];
            var fromEmail = _configuration["Smtp:From"];


            var subject = $"Kết quả bài thi: {quizDetail.QuizName}";
            var body = $@"
            <h2>Xin chào {fullName},</h2>
            <p>Bạn vừa hoàn thành bài thi <b>{quizDetail.QuizName}</b> ({quizDetail.ExamName})</p>
            <ul>
                <li>Thời gian bắt đầu: {quizDetail.StartedAt:dd/MM/yyyy HH:mm}</li>
                <li>Thời gian nộp bài: {quizDetail.FinishedAt:dd/MM/yyyy HH:mm}</li>
                <li>Điểm số: <b>{quizDetail.Score}</b></li>
            </ul>
            <p>Chúc mừng bạn đã hoàn thành bài thi!</p> ";

            var message = new MailMessage();
            message.From = new MailAddress(fromEmail, "Online Test System");
            message.To.Add(new MailAddress(toEmail));
            message.Subject = subject;
            message.Body = body;
            message.IsBodyHtml = true;

            var attachmentStream = new MemoryStream(excelFileBytes);
            var attachment = new Attachment(attachmentStream, $"{quizDetail.QuizName}_KetQua.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            message.Attachments.Add(attachment);

            using (var client = new SmtpClient(smtpHost, smtpPort))
            {
                client.Credentials = new NetworkCredential(smtpUser, smtpPass);
                client.EnableSsl = true;
                await client.SendMailAsync(message);
            }
        }
    }
}
