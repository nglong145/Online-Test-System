namespace OnlineTestSystem.BLL.ViewModels.Quiz
{
    public class RandomQuizLevelCreateRequest
    {
        public Guid QuestionBankId { get; set; }
        public int EasyCount { get; set; }
        public int MediumCount { get; set; }
        public int HardCount { get; set; }
        public int NumberOfQuizzes { get; set; }
        public int Duration { get; set; }
    }
}
