using FirebaseAdmin;
using FirebaseAdmin.Auth;
using Google.Apis.Auth.OAuth2;
using Microsoft.Extensions.Configuration;
using Portal.Application.Services;
using System.Text.RegularExpressions;

namespace Portal.Infrastructure.Services
{
    public class PhoneVerificationService : IPhoneVerificationService
    {
        private readonly IConfiguration _configuration;

        public PhoneVerificationService(IConfiguration configuration)
        {
            _configuration = configuration;
            InitializeFirebaseIfNeeded();
        }

        private void InitializeFirebaseIfNeeded()
        {
            if (FirebaseApp.DefaultInstance == null)
            {
                var credentialsPath = _configuration["Firebase:CredentialsPath"];
                var credentialsJson = _configuration["Firebase:CredentialsJson"];

                if (!string.IsNullOrWhiteSpace(credentialsPath) && File.Exists(credentialsPath))
                {
                    FirebaseApp.Create(new AppOptions()
                    {
                        Credential = GoogleCredential.FromFile(credentialsPath)
                    });
                }
                else if (!string.IsNullOrWhiteSpace(credentialsJson))
                {
                    FirebaseApp.Create(new AppOptions()
                    {
                        Credential = GoogleCredential.FromJson(credentialsJson)
                    });
                }
                else
                {
                    // Use Application Default Credentials if available (for cloud deployments)
                    try
                    {
                        FirebaseApp.Create(new AppOptions()
                        {
                            Credential = GoogleCredential.GetApplicationDefault()
                        });
                    }
                    catch
                    {
                        // If credentials are not available, service will fail when called
                        // This allows the app to start without Firebase credentials in development
                    }
                }
            }
        }

        public async Task<bool> VerifyPhoneTokenAsync(string idToken, string phoneNumber)
        {
            if (string.IsNullOrWhiteSpace(idToken) || string.IsNullOrWhiteSpace(phoneNumber))
            {
                return false;
            }

            try
            {
                if (FirebaseApp.DefaultInstance == null)
                {
                    return false;
                }

                var decodedToken = await FirebaseAuth.DefaultInstance.VerifyIdTokenAsync(idToken);
                
                // Verify phone number from the token matches the provided phone number
                if (!decodedToken.Claims.TryGetValue("phone_number", out var phoneClaim) || phoneClaim == null)
                {
                    return false;
                }

                var tokenPhoneNumber = phoneClaim.ToString();
                
                if (string.IsNullOrWhiteSpace(tokenPhoneNumber))
                {
                    return false;
                }

                // Normalize phone numbers for comparison (remove spaces, dashes, etc.)
                var normalizedTokenPhone = NormalizePhoneNumber(tokenPhoneNumber);
                var normalizedProvidedPhone = NormalizePhoneNumber(phoneNumber);

                return normalizedTokenPhone == normalizedProvidedPhone;
            }
            catch
            {
                return false;
            }
        }

        private string NormalizePhoneNumber(string phoneNumber)
        {
            // Remove all non-digit characters except +
            var normalized = Regex.Replace(phoneNumber, @"[^\d+]", "");
            
            // Ensure phone number starts with +
            if (!normalized.StartsWith("+"))
            {
                // If it doesn't start with +, assume Pakistan country code
                if (normalized.StartsWith("0"))
                {
                    normalized = "+92" + normalized.Substring(1);
                }
                else
                {
                    normalized = "+92" + normalized;
                }
            }

            return normalized;
        }
    }
}

