using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using MimeKit;
using Portal.Application.Services;

namespace Portal.Infrastructure.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly string _fromEmail;
        private readonly string _fromPassword;
        private readonly string _smtpHost;
        private readonly int _smtpPort;

        public EmailService(IConfiguration configuration)
        {

            _configuration = configuration;
            _fromEmail = _configuration["Email:FromEmail"] ?? "tauseef-ahmad@hotmail.com";
            _fromPassword = _configuration["Email:FromPassword"] ?? "";
            _smtpHost = _configuration["Email:SmtpHost"] ?? "smtp-mail.outlook.com";
            _smtpPort = int.Parse(_configuration["Email:SmtpPort"] ?? "587");
        }

        public async Task SendEmailAsync(string to, string subject, string body)
        {
            if (string.IsNullOrWhiteSpace(_fromPassword))
            {
                throw new InvalidOperationException("Email password is not configured. Please set Email:FromPassword in appsettings.json");
            }

            try
            {
                var message = new MimeMessage();
                message.From.Add(new MailboxAddress("Property Portal", _fromEmail));
                message.To.Add(new MailboxAddress("", to));
                message.Subject = subject;

                var bodyBuilder = new BodyBuilder
                {
                    HtmlBody = body
                };
                message.Body = bodyBuilder.ToMessageBody();

                using var client = new SmtpClient();
                await client.ConnectAsync(_smtpHost, _smtpPort, SecureSocketOptions.StartTls);
                
                // Note: For Outlook/Hotmail, you may need to use an App Password instead of your regular password
                // Go to Microsoft Account Security settings and generate an App Password
                await client.AuthenticateAsync(_fromEmail, _fromPassword);
                
                await client.SendAsync(message);
                await client.DisconnectAsync(true);
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException($"Failed to send email: {ex.Message}", ex);
            }
        }

        public async Task SendOtpEmailAsync(string to, string otp)
        {
            var subject = "Email Verification OTP - Property Portal";
            var body = $@"
                <html>
                <body style='font-family: Arial, sans-serif; padding: 20px;'>
                    <h2 style='color: #333;'>Email Verification</h2>
                    <p>Thank you for registering with Property Portal!</p>
                    <p>Your verification code is:</p>
                    <div style='background-color: #f0f0f0; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;'>
                        <h1 style='color: #000; margin: 0; font-size: 32px; letter-spacing: 5px;'>{otp}</h1>
                    </div>
                    <p>This code will expire in 10 minutes.</p>
                    <p>If you did not request this code, please ignore this email.</p>
                    <hr style='margin: 20px 0; border: none; border-top: 1px solid #ddd;'/>
                    <p style='color: #666; font-size: 12px;'>This is an automated message. Please do not reply.</p>
                </body>
                </html>";

            await SendEmailAsync(to, subject, body);
        }
    }
}

