namespace OnlineTestSystem.BLL.ViewModels.Question
{
    public class AddQuestionVm
    {
        public string Content { get; set; }
        public int Order {  get; set; }
        public string QuestionType { get; set; }
        public string? AudioUrl { get; set; }
        public bool IsActive { get; set; } 
        public string Level { get; set; }
        public Guid? BankId { get; set; }
    }
}
