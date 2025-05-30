using OnlineTestSystem.BLL.ViewModels.Answer;

namespace OnlineTestSystem.BLL.ViewModels.Question
{
    public class QuestionWithAnswersVm
    {
        public Guid Id { get; set; }
        public string Content { get; set; }
        public int Order {  get; set; }
        public float? Score { get; set; }
        public string QuestionType { get; set; }
        public string Level { get; set; }
        public bool IsActive { get; set; }
        public List<AnswerVm> Answers { get; set; }
    }
}
