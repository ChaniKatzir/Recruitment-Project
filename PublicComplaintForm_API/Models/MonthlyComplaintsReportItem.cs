namespace PublicComplaintForm_API.Models;

public class MonthlyComplaintsReportItem
{
    public int DepartmentId { get; set; }

    public string DepartmentName { get; set; } = string.Empty;

    public int CurrentMonthComplaints { get; set; }

    public int PreviousMonthComplaints { get; set; }

    public int SameMonthPreviousYearComplaints { get; set; }

    public int DifferenceFromPreviousMonth { get; set; }

    public int DifferenceFromPreviousYear { get; set; }
}