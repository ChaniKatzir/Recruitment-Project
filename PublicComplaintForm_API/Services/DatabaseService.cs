using PublicComplaintForm_API.Models;
using Microsoft.Data.SqlClient;
using System.Linq;
using Dapper;
using Microsoft.SqlServer.Server;
using log4net;

namespace PublicComplaintForm_API.Services
{
    public class DatabaseService
    {
        private readonly string _connectionString = string.Empty;
        private readonly string _surveyConnectionString = string.Empty;

        private readonly ILog _logger;

        public DatabaseService(ILog logger)
        {
            _logger = logger;
        }

        public DatabaseService(string connectionString, string surveyConnectionString, ILog logger)
        {
            _connectionString = connectionString ?? string.Empty;
            _surveyConnectionString = surveyConnectionString ?? string.Empty;
            _logger = logger;
        }

        public async Task<Guid> GetCourtId(string courtName)
        {
            return Guid.Empty;
        }

        public async Task<Guid> GetCityId(string cityName)
        {
            return Guid.Empty;
        }

        public async Task<Guid> DoesContactExist(string IdNumber)
        {
            return Guid.Empty;
        }

        public async Task<List<Court>> FetchCourtList()
        {
            return new List<Court>();
        }

        public async Task<Guid> InsertContact(PublicComplaintData formData)
        {
            return Guid.Empty;
        }

        public async Task<bool> InsertComplaint(
            PublicComplaintData formData,
            Guid contactId,
            Guid inquiryId,
            bool receivedFiles)
        {
            return false;
        }

        public async Task<bool> CanSubmitSurvey(SurveyData surveyData)
        {
            return false;
        }

        public async Task SubmitSurvey(SurveyData surveyData)
        {
            return;
        }

        public async Task SubmitForm(
            PublicComplaintData formData,
            List<string> files,
            Guid inquiryId,
            bool receivedFiles)
        {
            return;
        }
    }
}
