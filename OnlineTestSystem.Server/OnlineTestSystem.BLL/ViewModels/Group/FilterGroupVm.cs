namespace OnlineTestSystem.BLL.ViewModels.Group
{
    public  class FilterGroupVm
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public bool? IsActive { get; set; }
        public Guid? UserManager { get; set; }
        public string? ManagerName { get; set; }
    }
}
