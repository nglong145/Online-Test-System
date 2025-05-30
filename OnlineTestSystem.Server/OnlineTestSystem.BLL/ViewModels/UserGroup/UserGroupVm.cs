namespace OnlineTestSystem.BLL.ViewModels.UserGroup
{
    public class UserGroupVm
    {
        public Guid GroupId { get; set; }
        public string GroupName { get; set; }
        public string Description { get; set; }
        public DateTime CreatedAt { get; set; }
        public Guid? UserManager { get; set; }
        public int MemberCount { get; set; }
        public string? ManagerFisrtName { get; set; }
        public string? ManagerLastName { get; set; }

        public Guid UserId { get; set; }
        public string FullName { get; set; }
        public string StudentCode { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public string Address { get; set; }
        public bool? IsActive { get; set; }
        public Guid RoleId { get; set; }
        public string RoleName { get; set; }
    }
}
