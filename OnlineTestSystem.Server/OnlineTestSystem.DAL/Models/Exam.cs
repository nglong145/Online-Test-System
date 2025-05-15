namespace OnlineTestSystem.DAL.Models
{
    public class Exam
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string? Description { get; set; }
        public string? AccessCode { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public bool IsActive { get; set; } = true;

        public  ICollection<ExamQuiz> ExamQuizzes { get; set; }
        public   ICollection<ExamParticipant> Participants { get; set; }
        public ICollection<UserQuiz> UserQuizzes { get; set; }
        public   ICollection<ExamGroup> ExamGroups { get; set; }
    }
}
