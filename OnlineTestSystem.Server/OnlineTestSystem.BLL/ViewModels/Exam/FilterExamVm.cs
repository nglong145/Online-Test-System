namespace OnlineTestSystem.BLL.ViewModels.Exam
{
    public class FilterExamVm
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public DateTime? StartedAt { get; set; }
        public DateTime? FinishedAt { get; set; }
        public bool? IsActive { get; set; }
    }
}
