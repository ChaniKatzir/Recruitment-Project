# Public Complaint Form – Home Assignment

## Overview

This project extends the existing **Public Complaint Form** application by implementing the required functionality described in the assignment while preserving the existing architecture and coding style.

The goal was to integrate the new functionality naturally into the existing codebase while making the minimum necessary changes, maintaining consistency with the project's current design and conventions.

---

## Implemented Tasks

### 1. Contact Details Step

Implemented the **"Contact Details"** step, including:

- Complaint description (required, maximum 7000 characters)
- Court case number
- Court selection
- Character counter
- Client-side validation
- Navigation between wizard steps
- Preserving entered data while navigating between steps

---

### 2. Form Submission

Extended the existing submission flow.

The backend now:

- Receives the complete form as `multipart/form-data`
- Validates the captcha
- Validates uploaded file extensions
- Returns the submitted form data as JSON
- Returns the uploaded file names

According to the assignment requirements, no database persistence was implemented.

---

### 3. Monthly Complaints Report API

Added a new endpoint:

```
GET /monthly-report
```

The endpoint returns sample monthly complaint statistics per department.

Each report item contains:

- Department ID
- Department name
- Current month complaints
- Previous month complaints
- Same month previous year complaints
- Difference from previous month
- Difference from previous year

The endpoint currently returns mock data, as permitted by the assignment.

---

### 4. SQL Solution

Implemented an SQL query that generates a monthly complaints report including:

- Total complaints per department
- Comparison with the previous month
- Comparison with the same month in the previous year

The solution:

- Uses date ranges instead of `MONTH()` / `YEAR()` functions to allow efficient index usage.
- Uses `LEFT JOIN` so departments without complaints are still included.
- Includes indexing recommendations for better performance.

---

## Design Decisions

The existing application uses **ASP.NET Core Minimal APIs**, therefore the new endpoint was implemented in `Program.cs` to remain consistent with the existing project structure.

The implementation intentionally avoids unnecessary architectural changes and introduces only the functionality required by the assignment.

Where possible, existing services, validation mechanisms and project conventions were reused.

---

## Assumptions

The assignment explicitly allows using mock data for the reporting endpoint.

Therefore:

- No database was added.
- No repository or service layer was introduced for the report.
- The endpoint returns representative sample data.

---

## Running the Project

### Backend

```bash
dotnet run
```

### Frontend

```bash
npm install
npm start
```

For local development, make sure `config.json` contains:

```json
{
  "localhost": {
    "apiUrl": "http://localhost:5209"
  }
}
```

---

## Technologies

### Frontend

- Angular
- TypeScript
- Reactive Forms
- Angular Material

### Backend

- ASP.NET Core (.NET 8)
- C#
- Minimal APIs

### Database

- SQL Server (SQL solution)

---

## Future Improvements

If this project were extended into a production system, I would consider:

- Persisting complaint data in SQL Server.
- Moving report generation into a dedicated service layer.
- Adding automated unit and integration tests.
- Adding structured logging and monitoring.
- Implementing authentication and authorization.
- Adding pagination and filtering for reporting endpoints.

---

Thank you for reviewing my solution.
