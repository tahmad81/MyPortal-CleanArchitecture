
using AutoMapper;
using MediatR;
using Portal.Application.Commands.Register;
using Portal.Application.Dtos;
using Portal.Application.Interfaces;
using Portal.Application.Services;
using Portal.Core.Entities;
using System.Security.Cryptography;
using System.Text;

namespace Application.Features.Users.Handlers;

public class RegisterUserHandler : IRequestHandler<RegisterUserCommand, BaseResponse>
{
    private readonly IUserRepository _userRepo;
    private readonly IMapper _mapper;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IRecaptchaService _recaptchaService;
    private readonly IEmailOtpService _emailOtpService;

    public RegisterUserHandler(
        IUserRepository userRepo, 
        IMapper mapper,
        IPasswordHasher passwordHasher,
        IRecaptchaService recaptchaService,
        IEmailOtpService emailOtpService)
    {
        _userRepo = userRepo;
        _mapper = mapper;
        _passwordHasher = passwordHasher;
        _recaptchaService = recaptchaService;
        _emailOtpService = emailOtpService;
    }

    public async Task<BaseResponse> Handle(RegisterUserCommand request, CancellationToken cancellationToken)
    {
        // reCAPTCHA verification is disabled
        // if (string.IsNullOrWhiteSpace(request.User.RecaptchaToken))
        // {
        //     return BaseResponse.Failure("reCAPTCHA verification is required.");
        // }

        // var isRecaptchaValid = await _recaptchaService.VerifyTokenAsync(request.User.RecaptchaToken);
        // if (!isRecaptchaValid)
        // {
        //     return BaseResponse.Failure("reCAPTCHA verification failed. Please try again.");
        // }

        // Verify Email OTP
        if (string.IsNullOrWhiteSpace(request.User.EmailOtp))
        {
            return BaseResponse.Failure("Email verification is required. Please verify your email with OTP.");
        }

        if (string.IsNullOrWhiteSpace(request.User.Email))
        {
            return BaseResponse.Failure("Email is required.");
        }

        var isEmailOtpValid = await _emailOtpService.VerifyOtpAsync(request.User.Email, request.User.EmailOtp);
        
        if (!isEmailOtpValid)
        {
            return BaseResponse.Failure("Email verification failed. Please verify your email with OTP again.");
        }

        // Check if user already exists
        var existingUser = await _userRepo.GetByEmailAsync(request.User.Email);
        if (existingUser is not null)
        {
            return BaseResponse.Failure("User with this email already exists.");
        }

        // Check if phone number is already registered (if provided)
        if (!string.IsNullOrWhiteSpace(request.User.PhoneNumber))
        {
            var existingUserByPhone = await _userRepo.GetByPhoneNumberAsync(request.User.PhoneNumber);
            if (existingUserByPhone is not null)
            {
                return BaseResponse.Failure("User with this phone number already exists.");
            }
        }

        // Hash the password before storing
        var user = _mapper.Map<User>(request.User);
        user.PasswordHash = _passwordHasher.Hash(request.User.Password);
        user.EmailVerified = true; // Set to true since we verified email with OTP
        await _userRepo.AddAsync(user);
        
        return new RegisterUserResponse() { Success = true, UserName = user.Username };
    } 
}
