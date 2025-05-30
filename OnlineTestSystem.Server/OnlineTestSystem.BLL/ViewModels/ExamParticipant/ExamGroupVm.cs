namespace OnlineTestSystem.BLL.ViewModels.ExamParticipant
{
    public class ExamGroupVm
    {
        public Guid ExamId { get; set; }
        public string ExamName { get; set; }
        public string ExamDescription { get; set; }
        public string AccessCode { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public bool ExamStatus { get; set; }
        public Guid GroupId { get; set; }
        public string GroupName { get; set; }
        public string GroupDescription { get; set; }
        public Guid? UserManager { get; set; }
        public string UserManagerName { get; set; }
        public bool GroupStatus { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
