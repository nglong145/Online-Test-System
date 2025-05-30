using OnlineTestSystem.DAL.Models;

namespace OnlineTestSystem.BLL.ViewModels.Answer
{
    public class AddAnswerVm
    {
        public string Content { get; set; }
        public int Order { get; set; }
        public bool IsCorrect { get; set; }
        public bool IsActive { get; set; } 
        public Guid QuestionId { get; set; }
    }
}
