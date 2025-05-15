using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using OnlineTestSystem.BLL.Services.AnswerService;
using OnlineTestSystem.BLL.Services.AuthenticationService;
using OnlineTestSystem.BLL.Services.DoQuizService;
using OnlineTestSystem.BLL.Services.ExamService;
using OnlineTestSystem.BLL.Services.GroupService;
using OnlineTestSystem.BLL.Services.QuestionBankService;
using OnlineTestSystem.BLL.Services.QuestionService;
using OnlineTestSystem.BLL.Services.QuizCategoryService;
using OnlineTestSystem.BLL.Services.QuizService;
using OnlineTestSystem.BLL.Services.UserService;
using OnlineTestSystem.DAL.Data;
using OnlineTestSystem.DAL.Infrastructure;
using OnlineTestSystem.DAL.Models;
using System.Text;

var builder = WebApplication.CreateBuilder(args);


// Add services to the container.
builder.Services.AddDbContext<TestSystemDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddControllers();
builder.Services.AddHttpContextAccessor();

builder.Services.Configure<FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 104857600; // 100MB
});

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "MyAPI", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = @"JWT Authorization header using the Bearer scheme. \r\n\r\n 
                      Enter 'Bearer' [space] and then your token in the text input below.
                      \r\n\r\nExample: 'Bearer 12345abcdef'",
        Name = "Authorization",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
                {{
                          new OpenApiSecurityScheme
                          {
                              Reference = new OpenApiReference
                              {
                                  Type = ReferenceType.SecurityScheme,
                                  Id = "Bearer"
                              }
                          },
                         new string[] {}
                    }
                });
});

builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped<IAuthenticationService, AuthenticationService>();
builder.Services.AddScoped<IUserService, UserService>();


builder.Services.AddScoped<IExamService, ExamService>();
builder.Services.AddScoped<IQuizService, QuizService>();
builder.Services.AddScoped<IQuestionService, QuestionService>();
builder.Services.AddScoped<IAnswerService, AnswerService>();
builder.Services.AddScoped<IQuizQuestionService, QuizQuestionService>();

builder.Services.AddScoped<IGroupService, GroupService>();
builder.Services.AddScoped<IUserGroupService, UserGroupService>();


builder.Services.AddScoped<IQuestionBankService, QuestionBankService>();
builder.Services.AddScoped<IQuizCategoryService, QuizCategoryService>();

builder.Services.AddScoped<IExamGroupService, ExamGroupService>();
builder.Services.AddScoped<IExamQuizService, ExamQuizService>();
builder.Services.AddScoped<IExamParticipantService, ExamParticipantService>();

builder.Services.AddScoped<IUserQuizService, UserQuizService>();
builder.Services.AddScoped<IUserAnswerService, UserAnswerService>();


builder.Services.AddIdentity<User, Role>()
    .AddEntityFrameworkStores<TestSystemDbContext>()    
    .AddDefaultTokenProviders();


builder.Services.AddAuthentication(config =>
{
    config.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    config.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    config.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
})
    .AddJwtBearer(options =>
    {
        options.SaveToken = true;
        options.RequireHttpsMetadata = false;
        options.TokenValidationParameters = new TokenValidationParameters()
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(builder.Configuration["JWT:Secret"].ToString())),
            ValidateIssuer = true,
            ValidIssuer = builder.Configuration["JWT:Issuer"],
            ValidateAudience = true,
            ValidAudience = builder.Configuration["JWT:Audience"]
        };
    });

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
app.UseRouting();

app.UseHttpsRedirection();

app.UseCors();

app.UseAuthentication();
app.UseAuthorization();

app.UseCors(option =>
{
    option.AllowAnyHeader();
    option.AllowAnyMethod();
    option.AllowAnyOrigin();
});

app.MapControllers();

app.Run();
