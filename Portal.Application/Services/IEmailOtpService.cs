namespace Portal.Application.Services
{
    public interface IEmailOtpService
    {
        Task<string> GenerateAndSendOtpAsync(string email);
        Task<bool> VerifyOtpAsync(string email, string otp);
        Task<bool> IsEmailRegisteredAsync(string email);
    }
}

