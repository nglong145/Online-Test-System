namespace OnlineTestSystem.BLL.ViewModels.User
{
    public class ChangePasswordVm
    {
        public Guid UserId { get; set; }
        public string CurrentPassword { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }
}
