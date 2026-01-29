namespace Application.Dtos
{
    public class RegisterUserRequest
    {
            public string Username { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty; // store hashed password
            public string Email { get; set; } = "User";
            public string? FirstName { get; set; }
            public string? LastName { get; set; }
            public string? PhoneNumber { get; set; }
            public string RecaptchaToken { get; set; } = string.Empty;
            public string EmailOtp { get; set; } = string.Empty; // Email OTP instead of Firebase token
    }
}
