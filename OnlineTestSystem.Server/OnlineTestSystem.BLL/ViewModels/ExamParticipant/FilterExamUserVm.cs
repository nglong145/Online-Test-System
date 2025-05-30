namespace OnlineTestSystem.BLL.ViewModels.ExamParticipant
{
    public class FilterExamUserVm
    {
        public Guid? ExamId { get; set; }
        public string? ExamName { get; set; }
        public DateTime? StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public bool? ExamStatus { get; set; }
        public Guid? UserId { get; set; }
        public string? FullName { get; set; }
        public string? Email { get; set; }
        public Guid? RoleId { get; set; }
        public string? RoleName { get; set; }
        public bool? UserStatus { get; set; }
        public string? ParticipantStatus { get; set; }
    }
}
