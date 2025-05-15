namespace OnlineTestSystem.BLL.ViewModels.User
{
    public class UserVm
    {
        public Guid Id { get; set; }
        public string StudentCode {  get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public string Address { get; set; }
        public bool? IsActive { get; set; }
        public Guid RoleId { get; set; }
        public string RoleName { get; set; }
    }
}
