namespace OnlineTestSystem.BLL.ViewModels.QuestionBank
{
    public class FilterBankVm
    {
        public string? Name { get; set; }
        public Guid? OwnerId { get; set; }
        public string? OwnerFullName { get; set; }
        public Guid? QuizCategoryId { get; set; }
        public string? CategoryName { get; set; }
    }
}
