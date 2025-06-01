using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using OnlineTestSystem.DAL.Data;
using OnlineTestSystem.DAL.Models;

namespace OnlineTestSystem.DAL.Seed
{
    public static class SeedData
    {
        public static async Task InitializeAsync(TestSystemDbContext context)
        {
            if (await context.Roles.AnyAsync()) return; // Nếu đã có dữ liệu thì thôi

            // Tạo role Id cố định
            var adminRoleId = Guid.NewGuid();
            var teacherRoleId = Guid.NewGuid();
            var studentRoleId = Guid.NewGuid();

            var roles = new[]
            {
                new Role { Id = adminRoleId, Name = "admin", NormalizedName = "ADMIN" },
                new Role { Id = teacherRoleId, Name = "teacher", NormalizedName = "TEACHER" },
                new Role { Id = studentRoleId, Name = "student", NormalizedName = "STUDENT" }
            };
            await context.Roles.AddRangeAsync(roles);

            // Tạo user admin
            var hasher = new PasswordHasher<User>();
            var adminUserId = Guid.NewGuid();

            var adminUser = new User
            {
                Id = adminUserId,
                UserName = "admin@gmail.com",
                NormalizedUserName = "ADMIN@GMAIL.COM",
                Email = "admin@gmail.com",
                NormalizedEmail = "ADMIN@GMAIL.COM",
                EmailConfirmed = true,
                SecurityStamp = Guid.NewGuid().ToString("D"),
                RoleId = adminRoleId,
                FirstName = "Admin",
                LastName = "System",
                IsActive = true,
                CreatedAt = DateTime.Now
            };
            adminUser.PasswordHash = hasher.HashPassword(adminUser, "Admin@123");

            await context.Users.AddAsync(adminUser);

            await context.SaveChangesAsync();
        }
    }
}
