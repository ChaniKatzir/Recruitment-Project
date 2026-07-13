using log4net;
using log4net.Config;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Caching.Memory;
using PublicComplaintForm_API.Models;
using PublicComplaintForm_API.Services;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Png;
using System.Diagnostics;
using System.Net;
using System.Net.Mail;
using System.Reflection;
using System.Text;
using System.Text.Json;

string baseDir = AppContext.BaseDirectory;

string logDir = Path.Combine(baseDir, "logs");

if (!Directory.Exists(logDir))
{
    Directory.CreateDirectory(logDir);
}

string logPath = Path.Combine(baseDir, "logs", "app.log");

var builder = WebApplication.CreateBuilder(args);

var serverIdentity = Environment.GetEnvironmentVariable("ServerIdentity")
                     ?? string.Empty;

var envConfig = new ConfigSettings();
try
{
    builder.Configuration.GetSection(serverIdentity).Bind(envConfig);
}
catch(Exception ex)
{
    envConfig = new ConfigSettings();
    envConfig.SaveFileFolder = "DEFAULT VALUE";
    envConfig.LocalSQL = "DEFAULT VALUE";
    envConfig.SurveySQLConnectionString = "DEFAULT VALUE";
}

var logRepo = LogManager.GetRepository(Assembly.GetEntryAssembly());
XmlConfigurator.Configure(logRepo, new FileInfo("log4net.config"));

var allowedExtensions = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
{
    ".pdf", ".doc", ".docx", ".png", ".jpeg", ".jpg", ".gif", ".ogg", ".mp4", ".mp3", ".msg"
};

var dbService = new DatabaseService(envConfig.LocalSQL, envConfig.SurveySQLConnectionString, LogManager.GetLogger(typeof(Program)));

builder.Services.AddSingleton(LogManager.GetLogger(typeof(Program)));
builder.Services.AddMemoryCache();
builder.Services.AddSingleton(dbService);
builder.Services.AddSingleton<CaptchaService>();

builder.Services.AddAntiforgery(options =>
{
    options.HeaderName = "X-CSRF-TOKEN";
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AngularClient", policy =>
    {
        policy
            .WithOrigins("http://localhost:4200")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseCors("AngularClient");

if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}
else
{
    app.UseExceptionHandler(exceptionHandlerApp =>
    {
        exceptionHandlerApp.Run(async context =>
        {
            context.Response.StatusCode = StatusCodes.Status200OK;
            context.Response.ContentType = "application/json";

            var exceptionHandlerPathFeature = context.Features.Get<IExceptionHandlerPathFeature>();
            var exception = exceptionHandlerPathFeature?.Error;

            var logger = context.RequestServices.GetService<ILog>();
            logger?.Info("Unhandled exception: " + exception?.Message);

            await context.Response.WriteAsJsonAsync(new
            {
                error = "An error has occurred processing your request." + exception?.Message,
                requestId = System.Diagnostics.Activity.Current?.Id ?? context.TraceIdentifier
            });
        });
    });
}

app.Use(async (context, next) =>
{
    context.Response.Headers.Append("Referrer-Policy", "same-origin");

    // Older browsers use X-Frame-Options header
    context.Response.Headers.Append("X-Frame-Options", "DENY");

    // Newer browsers use Content-Security-Policy header
    context.Response.Headers.Append("Content-Security-Policy", "frame-ancestors 'none'");
    await next();
});

app.MapGet("/", async ([FromServices] ILog log) =>
{
    log.Info("Someone accessed root endpoint. (Endpoint: /)");
    return Results.Json("API is running...");
});

app.MapGet("/courts", async ([FromServices] ILog log,
                            [FromServices] DatabaseService db) =>
{
    //await logger.LogAsync("Someone accessed /courts endpoint. (Endpoint: /courts)");
    log.Info("Someone accessed /courts endpoint.");
    List<Court> courtsList = await db.FetchCourtList();

    return Results.Ok(new { courtsList });
});

app.MapGet("/monthly-report", () =>
{
    IReadOnlyList<MonthlyComplaintsReportItem> report =
    [
        new()
        {
            DepartmentId = 1,
            DepartmentName = "מחלקת פניות הציבור",

            CurrentMonthComplaints = 128,
            PreviousMonthComplaints = 114,
            SameMonthPreviousYearComplaints = 120,

            DifferenceFromPreviousMonth = 14,
            DifferenceFromPreviousYear = 8
        },

        new()
        {
            DepartmentId = 2,
            DepartmentName = "מחלקת ערעורים",

            CurrentMonthComplaints = 87,
            PreviousMonthComplaints = 93,
            SameMonthPreviousYearComplaints = 82,

            DifferenceFromPreviousMonth = -6,
            DifferenceFromPreviousYear = 5
        },

        new()
        {
            DepartmentId = 3,
            DepartmentName = "מזכירות בתי משפט",

            CurrentMonthComplaints = 205,
            PreviousMonthComplaints = 198,
            SameMonthPreviousYearComplaints = 210,

            DifferenceFromPreviousMonth = 7,
            DifferenceFromPreviousYear = -5
        }
    ];

    return Results.Ok(report);
});

app.MapGet("/captcha", async ([FromServices] CaptchaService cs,
                                [FromServices] ILog log,
                                IMemoryCache cache) =>
{
    //await logger.LogAsync("Someone accessed /captcha endpoint.");
    log.Info("Someone accessed /captcha endpoint.");

    var captcha = cs.GenerateCaptcha();

    var sessionId = Guid.NewGuid().ToString();

    cache.Set(sessionId, captcha.Code, TimeSpan.FromHours(1));

    using (var ms = new MemoryStream())
    {
        await captcha.Image!.SaveAsync(ms, PngFormat.Instance);

        var imageBytes = ms.ToArray();

        //await logger.LogAsync("Generated captcha image. (Session ID: " + sessionId + ")");
        log.Info("Generated captcha image. (Session ID: " + sessionId + ")");

        return Results.Ok(new { sessionId, captchaImage = Convert.ToBase64String(imageBytes) });
    }
});

app.MapPost("/survey", async([FromServices] IAntiforgery antiforgery,
                             [FromBody] SurveyData surveyData,
                             [FromServices] DatabaseService db) =>
{
    var result = await db.CanSubmitSurvey(surveyData);

    if(!result)
    {
        return Results.Ok("This survey has already been submitted.");
    }

    await db.SubmitSurvey(surveyData);

    return Results.Ok(surveyData);
}).DisableAntiforgery();

app.MapPost("/submit-form", async (
                                    HttpRequest request,
                                    [FromServices] ILog log,
                                    [FromServices] CaptchaService cs,
                                    IMemoryCache cache) =>
{
    var submittedForm = await request.ReadFormAsync();

    var submittedFields = submittedForm
        .Where(field => field.Key != "captchaCode"
                     && field.Key != "captchaSessionId")
        .ToDictionary(
            field => field.Key,
            field => field.Value.ToString());

    var captchaSessionId =
        submittedForm["captchaSessionId"].ToString();

    var captchaCode =
        submittedForm["captchaCode"].ToString();

    if (string.IsNullOrWhiteSpace(captchaSessionId) ||
        string.IsNullOrWhiteSpace(captchaCode))
    {
        return Results.BadRequest(new
        {
            Message = "Captcha data is missing."
        });
    }

    var isCaptchaValid = cs.ValidateCaptcha(
        captchaSessionId,
        captchaCode,
        cache);

    if (!isCaptchaValid)
    {
        return Results.BadRequest(new
        {
            Message = "Invalid captcha."
        });
    }

    var savedFiles = new List<string>();

    foreach (var file in submittedForm.Files)
    {
        var extension = Path.GetExtension(file.FileName);

        if (string.IsNullOrWhiteSpace(extension) ||
            !allowedExtensions.Contains(extension))
        {
            return Results.BadRequest(new
            {
                Message =
                    $"File '{file.FileName}' has an illegal file extension."
            });
        }

        savedFiles.Add(file.FileName);
    }

    log.Info(
        $"Form received successfully. " +
        $"Fields: {submittedFields.Count}, " +
        $"Files: {submittedForm.Files.Count}");

    var response = new
    {
        Message = "Form submitted successfully!",
        FormData = submittedFields,
        UploadedFiles = savedFiles
    };

    return Results.Ok(response);
}).DisableAntiforgery();

app.MapGet("/log", async (HttpContext context, [FromServices] IConfiguration config) =>
{
    // Default value
    int linesToRead = 50;

    // Parse optional query parameter
    if (context.Request.Query.TryGetValue("lines", out var linesVal) && int.TryParse(linesVal, out var parsedLines))
    {
        linesToRead = parsedLines;
    }

    Console.WriteLine(logPath);

    if (!File.Exists(logPath))
    {
        return Results.Ok("Log file not found.");
    }

    var lines = LogService.ReadLastLines(logPath, linesToRead);

    return Results.Json(lines, new System.Text.Json.JsonSerializerOptions
    {
        WriteIndented = true
    });
});

app.MapPost("/send-email", async (EmailRequest request) =>
{
    var smtpServer = "SERVER IP";
    var smtpPort = 587;
    var username = "USER";
    var password = "PASS";
    var fromAddress = "HabaNoreply@court.gov.il";

    // identical to your EmailService behavior
    ServicePointManager.ServerCertificateValidationCallback =
        (sender, certificate, chain, sslPolicyErrors) => true;

    // ---- NEW: Decode the Base64 issue string ----
    string decodedIssue;
    try
    {
        var bytes = Convert.FromBase64String(request.Issue);
        decodedIssue = Encoding.UTF8.GetString(bytes);
    }
    catch
    {
        decodedIssue = "**Failed to decode Base64 issue**";
    }
    // --------------------------------------------

    var subject = "בקשה חסומה - פניות הציבור";

    var body = $@"
        <div style='direction:rtl;text-align:right;'>
            <p>שלום,</p>
            <p>התקבלה בקשה שנחסמה במערכת.</p>
            <p><strong>פירוט הבעיה:</strong></p>
            <pre style='white-space:pre-wrap;font-family:consolas;background:#f2f2f2;padding:10px;border-radius:8px;'>
{decodedIssue}
            </pre>
            <p><strong>כתובת IP:</strong> {request.IP}</p>
        </div>
    ";

    try
    {
        using var smtp = new SmtpClient(smtpServer, smtpPort)
        {
            Credentials = new NetworkCredential(username, password),
            EnableSsl = true, // STARTTLS same as your config
            DeliveryMethod = SmtpDeliveryMethod.Network,
            UseDefaultCredentials = false
        };

        using var message = new MailMessage()
        {
            From = new MailAddress(fromAddress),
            Subject = subject,
            Body = body,
            IsBodyHtml = true
        };

        foreach (var recipient in envConfig.EmailList)
            message.To.Add(recipient);

        await smtp.SendMailAsync(message);

        return Results.Ok(new { success = true, message = "Email sent." });
    }
    catch (Exception ex)
    {
        return Results.Problem("Failed to send email: " + ex.Message);
    }
});


app.Run();