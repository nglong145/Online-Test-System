namespace OnlineTestSystem.BLL.ViewModels.ExamParticipant
{
    public class ExamParticipantVm
    {
        public Guid ExamId { get; set; }
        public string ExamName { get; set; }
        public string ExamDescription { get; set; }
        public string AccessCode { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public bool ExamStatus { get; set; }
        public Guid UserId { get; set; }
        public string FullName { get; set; }
        public string StudentCode { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public string Address { get; set; }
        public Guid RoleId { get; set; }
        public string RoleName { get; set; }
        public bool? UserStatus { get; set; }
        public DateTime CreatedAt { get; set; }


        public string ParticipantStatus { get; set; }
        public string? Note { get; set; }
    }
}
