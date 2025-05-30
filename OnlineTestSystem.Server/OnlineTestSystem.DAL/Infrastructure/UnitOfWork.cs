using OnlineTestSystem.DAL.Data;
using OnlineTestSystem.DAL.Models;
using OnlineTestSystem.DAL.Repositories;
using System.Drawing;

namespace OnlineTestSystem.DAL.Infrastructure
{
    public class UnitOfWork:IUnitOfWork
    {
        private readonly TestSystemDbContext _context;
        public TestSystemDbContext Context => _context;

        private IGenericRepository<Exam>? _examRepository;
        private IGenericRepository<Answer>? _answerRepository;
        private IGenericRepository<Quiz>? _quizRepository;
        private IGenericRepository<Question>? _questionRepository;
        private IGenericRepository<QuizQuestion>? _quizQuestionRepository;

        private IGenericRepository<Group>? _groupRepository;
        private IGenericRepository<UserGroup>? _userGroupRepository;

        private IGenericRepository<QuizCategory>? _categoryRepository;
        private IGenericRepository<QuestionBank>? _bankRepository;

        private IGenericRepository<ExamParticipant>? _examParticipantRepository;
        private IGenericRepository<ExamGroup>? _examGroupRepository;
        private IGenericRepository<ExamQuiz>? _examQuizRepository;

        private IGenericRepository<UserAnswer>? _userAnswerRepository;



        public IGenericRepository<Exam> ExamRepository => _examRepository ?? new GenericRepository<Exam>(_context);
        public IGenericRepository<Answer> AnswerRepository => _answerRepository ?? new GenericRepository<Answer>(_context);
        public IGenericRepository<Quiz> QuizRepository => _quizRepository ?? new GenericRepository<Quiz>(_context);
        public IGenericRepository<Question> QuestionRepository => _questionRepository ?? new GenericRepository<Question>(_context);
        public IGenericRepository<QuizQuestion> QuizQuestionRepository => _quizQuestionRepository ?? new GenericRepository<QuizQuestion>(_context);

        public IGenericRepository<Group> GroupRepository => _groupRepository ?? new GenericRepository<Group>(_context);
        public IGenericRepository<UserGroup> UserGroupRepository => _userGroupRepository ?? new GenericRepository<UserGroup>(_context);

        public IGenericRepository<QuizCategory> CategoryRepository => _categoryRepository ?? new GenericRepository<QuizCategory>(_context);
        public IGenericRepository<QuestionBank> BankRepository => _bankRepository ?? new GenericRepository<QuestionBank>(_context);



        public IGenericRepository<ExamParticipant> ExamParticipantRepository => _examParticipantRepository ?? new GenericRepository<ExamParticipant>(_context);
        public IGenericRepository<ExamGroup> ExamGroupRepository => _examGroupRepository ?? new GenericRepository<ExamGroup>(_context);
        public IGenericRepository<ExamQuiz> ExamQuizRepository => _examQuizRepository ?? new GenericRepository<ExamQuiz>(_context);

        public IGenericRepository<UserAnswer> UserAnswer => _userAnswerRepository ?? new GenericRepository<UserAnswer>(_context);



        public UnitOfWork(TestSystemDbContext context)
        {
            _context = context;
        }

        public int SaveChanges()
        {
            return _context.SaveChanges();
        }

        public async Task<int> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync();
        }

        public IGenericRepository<TEntity> GenericRepository<TEntity>() where TEntity : class
        {
            return new GenericRepository<TEntity>(_context);
        }

        public async Task BeginTransactionAsync()
        {
            await _context.Database.BeginTransactionAsync();
        }

        public async Task CommitTransactionAsync()
        {
            await _context.Database.CommitTransactionAsync();
        }

        public async Task RollbackTransactionAsync()
        {
            await _context.Database.RollbackTransactionAsync();
        }

        public void Dispose()
        {
            _context.Dispose();
        }
    }
}
