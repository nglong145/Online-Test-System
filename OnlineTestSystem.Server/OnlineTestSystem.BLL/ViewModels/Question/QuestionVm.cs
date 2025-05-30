using OnlineTestSystem.DAL.Models;

namespace OnlineTestSystem.BLL.ViewModels.Question
{
    public class QuestionVm
    {
        public Guid Id { get; set; }
        public int Order { get; set; }
        public string Content { get; set; }
        public string QuestionType { get; set; }
        public string? AudioUrl { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; } 
        public string Level { get; set; }
        public Guid? BankId { get; set; }
        public string BankName { get; set; }


    }
}
