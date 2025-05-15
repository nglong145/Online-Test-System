using Microsoft.AspNetCore.Identity;

namespace OnlineTestSystem.DAL.Models
{
    public class Role : IdentityRole<Guid>
    {
        public ICollection<User> Users { get; set; }
    }
}
