namespace PublicComplaintForm_API.Models
{
    public class SurveyData
    {
        public List<SurveyQuestion> surveyQuestions { get; set; } = new List<SurveyQuestion>();
        public string surveyId { get; set; } = string.Empty;
    }
}
