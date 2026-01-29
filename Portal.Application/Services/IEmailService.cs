namespace Portal.Application.Services
{
    public interface IEmailService
    {
        Task SendEmailAsync(string to, string subject, string body);
        Task SendOtpEmailAsync(string to, string otp);
    }
}

