namespace OnlineTestSystem.DAL.Models
{
    public class ExamParticipant
    {
        public Guid ExamId { get; set; }
        public Exam Exam { get; set; }
        public Guid UserId { get; set; }
        public User User { get; set; }
        public string Status { get; set; }
        public string? Note { get; set; }
    }
}
