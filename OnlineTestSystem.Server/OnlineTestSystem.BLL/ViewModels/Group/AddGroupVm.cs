using OnlineTestSystem.DAL.Models;

namespace OnlineTestSystem.BLL.ViewModels.Group
{
    public class AddGroupVm
    {
        public string Name { get; set; }
        public string? Description { get; set; }
        public bool IsActive { get; set; }
        public Guid? UserManager { get; set; }
    }
}
