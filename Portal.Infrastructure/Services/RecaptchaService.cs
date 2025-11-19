using Microsoft.Extensions.Configuration;
using Portal.Application.Services;
using System.Net.Http.Json;

namespace Portal.Infrastructure.Services
{
    public class RecaptchaService : IRecaptchaService
    {
        private readonly HttpClient _httpClient;
        private readonly string _secretKey;

        public RecaptchaService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _secretKey = configuration["Recaptcha:SecretKey"] ?? throw new InvalidOperationException("Recaptcha:SecretKey is not configured.");
        }

        public async Task<bool> VerifyTokenAsync(string token)
        {
            if (string.IsNullOrWhiteSpace(token))
            {
                return false;
            }

            try
            {
                var response = await _httpClient.PostAsync(
                    $"https://www.google.com/recaptcha/api/siteverify?secret={_secretKey}&response={token}",
                    null);

                if (!response.IsSuccessStatusCode)
                {
                    return false;
                }

                var result = await response.Content.ReadFromJsonAsync<RecaptchaResponse>();
                return result?.Success ?? false;
            }
            catch
            {
                return false;
            }
        }

        private class RecaptchaResponse
        {
            public bool Success { get; set; }
            public string? ChallengeTs { get; set; }
            public string? Hostname { get; set; }
            public string[]? ErrorCodes { get; set; }
        }
    }
}

