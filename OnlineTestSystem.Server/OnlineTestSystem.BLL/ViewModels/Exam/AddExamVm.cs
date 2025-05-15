namespace OnlineTestSystem.BLL.ViewModels.Exam
{
    public class AddExamVm
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public string AccessCode { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public bool IsActive { get; set; }
    }
}
