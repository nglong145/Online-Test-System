namespace OnlineTestSystem.BLL.ViewModels.ExamParticipant
{
    public class FilterExamGroupVm
    {
        public Guid? ExamId { get; set; }
        public string? ExamName { get; set; }
        public DateTime? StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public bool? ExamStatus { get; set; }
        public Guid? GroupId { get; set; }
        public string? GroupName { get; set; }
        public Guid? UserManager { get; set; }
        public string? UserManagerName { get; set; }
        public bool? GroupStatus { get; set; }

    }
}
