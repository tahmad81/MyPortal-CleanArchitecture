using Portal.Application.Interfaces;
using Portal.Application.Services;
using System.Collections.Concurrent;

namespace Portal.Infrastructure.Services
{
    public class EmailOtpService : IEmailOtpService
    {
        private readonly IEmailService _emailService;
        
        // In-memory storage for OTPs. In production, consider using Redis or database
        private static readonly ConcurrentDictionary<string, OtpData> _otpStorage = new();
        private static readonly TimeSpan OtpExpirationTime = TimeSpan.FromMinutes(10);
        private readonly IUserRepository _userRepo;
        public EmailOtpService(IEmailService emailService, IUserRepository userRepo)
        {
            _emailService = emailService;
            _userRepo = userRepo;
        }

        public async Task<string> GenerateAndSendOtpAsync(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
            {
                throw new ArgumentException("Email cannot be empty", nameof(email));
            }

            //if (await IsEmailRegisteredAsync(email))
            //{
            //    throw new InvalidOperationException("This email is already registered.");
            //}

            // Generate 6-digit OTP
            var random = new Random();
            var otp = random.Next(100000, 999999).ToString();

            // Store OTP with expiration
            var otpData = new OtpData
            {
                Otp = otp,
                ExpiresAt = DateTime.UtcNow.Add(OtpExpirationTime),
                Attempts = 0
            };

            _otpStorage.AddOrUpdate(email.ToLowerInvariant(), otpData, (key, oldValue) => otpData);

            // Send email
            await _emailService.SendOtpEmailAsync(email, otp);

            // Clean up expired OTPs
            CleanupExpiredOtps();

            return otp;
        }

        public Task<bool> VerifyOtpAsync(string email, string otp)
        {
            if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(otp))
            {
                return Task.FromResult(false);
            }

            var emailKey = email.ToLowerInvariant();

            if (!_otpStorage.TryGetValue(emailKey, out var otpData))
            {
                return Task.FromResult(false);
            }

            // Check if OTP has expired
            if (DateTime.UtcNow > otpData.ExpiresAt)
            {
                _otpStorage.TryRemove(emailKey, out _);
                return Task.FromResult(false);
            }

            // Check attempt limit (max 5 attempts)
            if (otpData.Attempts >= 5)
            {
                _otpStorage.TryRemove(emailKey, out _);
                return Task.FromResult(false);
            }

            // Increment attempts
            otpData.Attempts++;

            // Verify OTP
            if (otpData.Otp == otp)
            {
                // Remove OTP after successful verification
                _otpStorage.TryRemove(emailKey, out _);
                return Task.FromResult(true);
            }

            // If verification failed but attempts remain, update storage
            if (otpData.Attempts < 5)
            {
                _otpStorage.AddOrUpdate(emailKey, otpData, (key, oldValue) => otpData);
            }
            else
            {
                _otpStorage.TryRemove(emailKey, out _);
            }

            return Task.FromResult(false);
        }

        public async Task<bool> IsEmailRegisteredAsync(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
            {
                return false;
            }

            var user = await _userRepo.GetByEmailAsync(email);
            return user != null;
        }

        private void CleanupExpiredOtps()
        {
            var expiredKeys = _otpStorage
                .Where(kvp => DateTime.UtcNow > kvp.Value.ExpiresAt)
                .Select(kvp => kvp.Key)
                .ToList();

            foreach (var key in expiredKeys)
            {
                _otpStorage.TryRemove(key, out _);
            }
        }

        private class OtpData
        {
            public string Otp { get; set; } = string.Empty;
            public DateTime ExpiresAt { get; set; }
            public int Attempts { get; set; }
        }
    }
}

