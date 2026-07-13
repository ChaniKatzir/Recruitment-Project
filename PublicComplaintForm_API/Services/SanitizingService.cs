using Ganss.Xss;

namespace PublicComplaintForm_API.Services
{
    public class SanitizingService
    {
        public void SanitizeClass(object unsanitizedClass)
        {
            if (unsanitizedClass == null) return;

            var sanitizer = new HtmlSanitizer();
            var type = unsanitizedClass.GetType();

            foreach (var prop in type.GetProperties())
            {
                if (prop.CanRead && prop.CanWrite && prop.PropertyType == typeof(string))
                {
                    var value = prop.GetValue(unsanitizedClass) as string;

                    if (value != null)
                    {
                        var sanitizedValue = sanitizer.Sanitize(value);
                        prop.SetValue(unsanitizedClass, sanitizedValue);
                    }
                }
            }
        }
    }
}
