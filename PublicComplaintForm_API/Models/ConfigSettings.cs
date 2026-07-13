namespace PublicComplaintForm_API.Models
{
    public class ConfigSettings
    {
        public string LocalSQL { get; set; }
        public string SaveFileFolder { get; set; }
        public string SurveySQLConnectionString { get; set; }
        public List<string> EmailList { get; set; }
    }
}