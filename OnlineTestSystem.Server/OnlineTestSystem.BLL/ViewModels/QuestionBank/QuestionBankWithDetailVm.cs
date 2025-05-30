using OnlineTestSystem.BLL.ViewModels.Question;

namespace OnlineTestSystem.BLL.ViewModels.QuestionBank
{
    public class QuestionBankWithDetailVm
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public Guid? QuizCategoryId { get; set; }
        public string? CategoryName { get; set; }
        public Guid? OwnerId { get; set; }
        public string? OwnerFullName { get; set; }

        public List<QuestionWithAnswersVm> Questions { get; set; }
    }
}
