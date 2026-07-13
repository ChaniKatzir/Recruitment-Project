using SixLabors.ImageSharp;

namespace PublicComplaintForm_API.Models
{
    public class CustomCaptcha
    {
        public string? Code { get; set; }
        public Image? Image { get; set; }
    }
}
