using Microsoft.EntityFrameworkCore.Design;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace OnlineTestSystem.DAL.Data
{
    public class TestSystemDbContextFactory : IDesignTimeDbContextFactory<TestSystemDbContext>
    {
        public TestSystemDbContext CreateDbContext(string[] args)
        {
            var configuration = new ConfigurationBuilder()
                .SetBasePath(Path.Combine(Directory.GetCurrentDirectory(), "../OnlineTestSystem.Presentation")) 
                .AddJsonFile("appsettings.json")
                .Build();

            var optionsBuilder = new DbContextOptionsBuilder<TestSystemDbContext>();
            var connectionString = configuration.GetConnectionString("DefaultConnection");

            optionsBuilder.UseSqlServer(connectionString);

            return new TestSystemDbContext(optionsBuilder.Options);
        }
    }
}
