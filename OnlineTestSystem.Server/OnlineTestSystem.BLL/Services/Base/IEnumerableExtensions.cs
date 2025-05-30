using OnlineTestSystem.DAL.Models;

namespace OnlineTestSystem.BLL.Services.Base
{
    public static class IEnumerableExtensions
    {
        public static IEnumerable<T> Shuffle<T>(this IEnumerable<T> source)
        {
            var rnd = new Random();
            var elements = source.ToList();
            for (int i = elements.Count - 1; i > 0; i--)
            {
                int swapIndex = rnd.Next(i + 1);
                var temp = elements[i];
                elements[i] = elements[swapIndex];
                elements[swapIndex] = temp;
            }
            return elements;
        }

        public static IEnumerable<Question> ShuffleByLevel(
              this IEnumerable<Question> source,
              int easyCount,
              int mediumCount,
              int hardCount)
        {
            // Lấy từng nhóm mức độ
            var easy = source.Where(x => x.Level == QuestionLevel.Easy).Shuffle().Take(easyCount);
            var medium = source.Where(x => x.Level == QuestionLevel.Medium).Shuffle().Take(mediumCount);
            var hard = source.Where(x => x.Level == QuestionLevel.Hard).Shuffle().Take(hardCount);

            // Gộp lại và đảo ngẫu nhiên lần cuối
            var all = easy.Concat(medium).Concat(hard).ToList();
            return all.Shuffle();
        }
    }
}
