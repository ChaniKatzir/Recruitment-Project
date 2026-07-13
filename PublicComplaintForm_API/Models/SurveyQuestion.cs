namespace PublicComplaintForm_API.Models
{
    public class SurveyQuestion
    {
        public string Question { get; set; } = string.Empty;
        public string Answer { get; set; } = string.Empty;
        public bool IsFreeText { get; set; } = false;
    }
}
