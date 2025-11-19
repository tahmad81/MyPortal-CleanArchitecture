namespace Portal.Application.Services
{
    public interface IRecaptchaService
    {
        Task<bool> VerifyTokenAsync(string token);
    }
}

