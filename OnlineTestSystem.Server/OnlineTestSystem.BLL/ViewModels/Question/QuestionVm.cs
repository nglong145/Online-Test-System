using OnlineTestSystem.DAL.Models;

namespace OnlineTestSystem.BLL.ViewModels.Question
{
    public class QuestionVm
    {
        public Guid Id { get; set; }
        public string Content { get; set; }
        public string QuestionType { get; set; }
        public string? AudioUrl { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public string Level { get; set; }
        public Guid? BankId { get; set; }
    }
}
