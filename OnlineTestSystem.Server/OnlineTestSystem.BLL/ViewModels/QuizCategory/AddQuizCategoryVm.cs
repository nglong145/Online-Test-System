namespace OnlineTestSystem.BLL.ViewModels.QuizCategory
{
    public class AddQuizCategoryVm
    {
        public string Name { get; set; }
        public string? Description { get; set; }
        public bool IsActive { get; set; } 
        public Guid? ParentId { get; set; }
    }
}
