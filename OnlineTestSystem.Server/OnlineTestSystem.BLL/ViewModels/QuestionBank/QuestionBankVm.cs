
namespace OnlineTestSystem.BLL.ViewModels.QuestionBank
{
    public class QuestionBankVm
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public Guid? OwnerId { get; set; }
        public string OwnerFullName { get; set; }
        public Guid? QuizCategoryId { get; set; }
        public string CategoryName { get; set; }
        public int TotalQuestion {  get; set; }
    }
}
