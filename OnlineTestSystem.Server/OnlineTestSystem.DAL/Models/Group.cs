namespace OnlineTestSystem.DAL.Models
{
    public class Group
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string? Description { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public Guid? UserManager { get; set; }
        public User Manager { get; set; }
        public ICollection<UserGroup> UserGroups { get; set; }
        public ICollection<ExamGroup> ExamGroups { get; set; }
    }
}
