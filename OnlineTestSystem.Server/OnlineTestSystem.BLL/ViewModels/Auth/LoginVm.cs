using System.ComponentModel.DataAnnotations;

namespace OnlineTestSystem.BLL.ViewModels.Auth
{
    public class LoginVm
    {
        [Required(ErrorMessage = "Email is required!")]
        public string Email { get; set; }
        [Required(ErrorMessage = "Password is required!")]
        public string Password { get; set; }
    }
}
