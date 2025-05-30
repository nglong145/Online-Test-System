using OnlineTestSystem.DAL.Models;

namespace OnlineTestSystem.BLL.ViewModels.UploadFile
{
    public class QuestionImportModel
    {
        public string Content { get; set; }
        public int Order {  get; set; }
        public QuestionType QuestionType { get; set; } = QuestionType.SingleChoice; 
        public QuestionLevel Level { get; set; } = QuestionLevel.Medium; 
        public List<AnswerImportModel> Answers { get; set; } = new List<AnswerImportModel>();
    }
}
