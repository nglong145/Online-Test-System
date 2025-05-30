namespace OnlineTestSystem.BLL.ViewModels.QuestionBank
{
    public class AddQuestionBankVm
    {
        public string Name { get; set; }
        public Guid? OwnerId { get; set; }
        public Guid? QuizCategoryId { get; set; }
    }

    public class UpdateQuestionBankVm
    {
        public string Name { get; set; }
        public Guid? OwnerId { get; set; }
        public Guid? QuizCategoryId { get; set; }
        public bool IsActive { get; set; } = true;  
    }
}
