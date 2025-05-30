using OnlineTestSystem.BLL.ViewModels.Question;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OnlineTestSystem.BLL.ViewModels.Quiz
{
    public class QuizWithDetailVm
    {
        public Guid Id { get; set; }
        public Guid? Category { get; set; }
        public string CategoryName { get; set; }
        public string Title { get; set; }
        public string? Description { get; set; }
        public int Duration { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }

        public List<QuestionWithAnswersVm> Questions { get; set; }
    }
}
