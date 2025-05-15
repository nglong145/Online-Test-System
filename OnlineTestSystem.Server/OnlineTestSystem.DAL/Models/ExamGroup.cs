namespace OnlineTestSystem.DAL.Models
{
    public class ExamGroup
    {
        public Guid ExamId { get; set; }
        public Exam Exam { get; set; }
        public Guid GroupId { get; set; }
        public Group Group { get; set; }
    }
}
