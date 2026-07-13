namespace PublicComplaintForm_API.Services
{
    public class LogService
    {
        private readonly string _logFilePath;
        private readonly object _lock = new();

        public LogService(string logFilePath)
        {
            _logFilePath = logFilePath;

            // Optional: Ensure the directory exists
            var directory = Path.GetDirectoryName(_logFilePath);
            if (!string.IsNullOrEmpty(directory) && !Directory.Exists(directory))
            {
                Directory.CreateDirectory(directory);
            }
        }

        public static List<string> ReadLastLines(string path, int lineCount)
        {
            Console.WriteLine(path);

            var result = new List<string>();
            using var fs = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);
            using var sr = new StreamReader(fs);

            var lines = new LinkedList<string>();
            while (!sr.EndOfStream)
            {
                var line = sr.ReadLine();
                if (lines.Count >= lineCount)
                    lines.RemoveFirst();
                lines.AddLast(line);
            }

            return lines.ToList();
        }
    }
}
