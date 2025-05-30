namespace OnlineTestSystem.BLL.ViewModels.Group
{
    public class GroupVm
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string? Description { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public Guid? UserManager { get; set; }

        public int MemberCount { get; set; }

        public string? ManagerFisrtName { get; set; }
        public string? ManagerLastName { get; set; }

    }
}
