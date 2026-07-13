namespace PublicComplaintForm_API.Models
{
    public class Court
    {
        public Guid CourtId { get; set; } = Guid.Empty;
        public string CourtName { get; set; } = string.Empty;
    }
}
