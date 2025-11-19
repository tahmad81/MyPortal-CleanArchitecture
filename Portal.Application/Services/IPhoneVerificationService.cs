namespace Portal.Application.Services
{
    public interface IPhoneVerificationService
    {
        Task<bool> VerifyPhoneTokenAsync(string idToken, string phoneNumber);
    }
}

