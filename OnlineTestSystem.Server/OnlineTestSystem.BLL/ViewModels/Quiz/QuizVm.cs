namespace OnlineTestSystem.BLL.ViewModels.Quiz
{
    public class QuizVm
    {
        public Guid Id { get; set; }
        public Guid? Category { get; set; }
        public string CategoryName { get; set; }    
        public string Title { get; set; }
        public string? Description { get; set; }
        public int Duration { get; set; }
        public int TotalQuestion { get; set; }
        public bool IsActive { get; set; } 
        public DateTime CreatedAt { get; set; } 
    }
}
