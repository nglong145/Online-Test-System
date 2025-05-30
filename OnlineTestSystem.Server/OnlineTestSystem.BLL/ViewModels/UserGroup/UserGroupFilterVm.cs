namespace OnlineTestSystem.BLL.ViewModels.UserGroup
{
    public class UserGroupFilterVm
    {
        public Guid? GroupId { get; set; }
        public string? GroupName { get; set; }
        public bool? GroupActive { get; set; }
        public Guid? UserManager { get; set; }
        public string? ManagerName { get; set; }

        public Guid? UserId { get; set; }
        public string? FullName { get; set; }
        public string? StudentCode { get; set; }
        public bool? UserActive { get; set; }
        public Guid? RoleId { get; set; }
    }
}
