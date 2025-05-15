namespace OnlineTestSystem.BLL.ViewModels.Quiz
{
    public class FilterQuizVm
    {
        public Guid? Category { get; set; }
        public string? CategoryName { get; set; }
        public string? Title { get; set; }
        public string? Description { get; set; }
        public int? Duration { get; set; }
        public bool? IsActive { get; set; }

    }
}
