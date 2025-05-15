namespace OnlineTestSystem.BLL.ViewModels.QuizCategory
{
    public class QuizCategoryVm
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string? Description { get; set; }
        public bool IsActive { get; set; }
        public Guid? ParentId { get; set; }
        public string? ParentName { get; set; }
    }
}
