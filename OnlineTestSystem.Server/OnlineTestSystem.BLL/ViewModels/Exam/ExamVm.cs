namespace OnlineTestSystem.BLL.ViewModels.Exam
{
    public class ExamVm
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string AccessCode { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public bool IsActive { get; set; }
    }
}
