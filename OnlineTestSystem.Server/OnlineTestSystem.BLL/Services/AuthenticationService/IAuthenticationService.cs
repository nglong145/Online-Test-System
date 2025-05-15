using OnlineTestSystem.BLL.ViewModels.Auth;
using OnlineTestSystem.BLL.ViewModels.User;

namespace OnlineTestSystem.BLL.Services.AuthenticationService
{
    public interface IAuthenticationService
    {
        Task<string> RegisterUserAsync(RegisterVm registerVm);
        Task<AuthResultVm> RefreshTokenAsync(string refreshToken);
        Task<AuthResultVm> LoginUserAsync(LoginVm loginVm);

        Task<UserVm> GetUserInfoAsync(Guid userId);
    }
}
