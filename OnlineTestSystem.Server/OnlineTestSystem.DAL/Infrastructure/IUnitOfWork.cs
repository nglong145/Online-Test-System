using OnlineTestSystem.DAL.Data;
using OnlineTestSystem.DAL.Models;
using OnlineTestSystem.DAL.Repositories;

namespace OnlineTestSystem.DAL.Infrastructure
{
    public interface IUnitOfWork:IDisposable
    {
        TestSystemDbContext Context { get; }
        IGenericRepository<TEntity> GenericRepository<TEntity>() where TEntity : class;
        int SaveChanges();
        Task<int> SaveChangesAsync();
        Task BeginTransactionAsync();
        Task CommitTransactionAsync();
        Task RollbackTransactionAsync();
    }
}
