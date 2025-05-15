namespace OnlineTestSystem.BLL.ViewModels.User
{
    public class FilterUserVm
    {
        public string? StudentCode { get; set; }
        public string? Name { get; set; }
        public string? Email { get; set; }
        public string? Address { get; set; }
        public DateTime? StartDate { get; set; }  // Ngày bắt đầu
        public DateTime? EndDate { get; set; }    // Ngày kết thúc
        public string? PhoneNumber { get; set; }
        public bool? IsActive { get; set; }
    }
}
