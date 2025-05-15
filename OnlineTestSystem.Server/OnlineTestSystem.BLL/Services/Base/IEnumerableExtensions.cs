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
    }
}
