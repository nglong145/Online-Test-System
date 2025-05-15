namespace OnlineTestSystem.BLL.ViewModels.Quiz
{
    public class RandomQuizCreateRequest
    {
        public Guid QuestionBankId { get; set; }
        public int NumberOfQuestionsPerQuiz { get; set; }
        public int NumberOfQuizzes { get; set; }
        public int Duration { get; set; }
    }
}
