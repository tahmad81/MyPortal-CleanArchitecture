
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
    private readonly IPhoneVerificationService _phoneVerificationService;

    public RegisterUserHandler(
        IUserRepository userRepo, 
        IMapper mapper,
        IPasswordHasher passwordHasher,
        IRecaptchaService recaptchaService,
        IPhoneVerificationService phoneVerificationService)
    {
        _userRepo = userRepo;
        _mapper = mapper;
        _passwordHasher = passwordHasher;
        _recaptchaService = recaptchaService;
        _phoneVerificationService = phoneVerificationService;
    }

    public async Task<BaseResponse> Handle(RegisterUserCommand request, CancellationToken cancellationToken)
    {
        // Verify reCAPTCHA token
        if (string.IsNullOrWhiteSpace(request.User.RecaptchaToken))
        {
            return BaseResponse.Failure("reCAPTCHA verification is required.");
        }

        var isRecaptchaValid = await _recaptchaService.VerifyTokenAsync(request.User.RecaptchaToken);
        if (!isRecaptchaValid)
        {
            return BaseResponse.Failure("reCAPTCHA verification failed. Please try again.");
        }

        // Verify Firebase phone token
        if (string.IsNullOrWhiteSpace(request.User.FirebaseIdToken))
        {
            return BaseResponse.Failure("Phone verification is required.");
        }

        if (string.IsNullOrWhiteSpace(request.User.PhoneNumber))
        {
            return BaseResponse.Failure("Phone number is required.");
        }

        var isPhoneValid = await _phoneVerificationService.VerifyPhoneTokenAsync(
            request.User.FirebaseIdToken, 
            request.User.PhoneNumber);
        
        if (!isPhoneValid)
        {
            return BaseResponse.Failure("Phone verification failed. Please verify your phone number again.");
        }

        // Check if user already exists
        var existingUser = await _userRepo.GetByEmailAsync(request.User.Email);
        if (existingUser is not null)
        {
            return BaseResponse.Failure("User with this email already exists.");
        }

        // Check if phone number is already registered
        var existingUserByPhone = await _userRepo.GetByPhoneNumberAsync(request.User.PhoneNumber);
        if (existingUserByPhone is not null)
        {
            return BaseResponse.Failure("User with this phone number already exists.");
        }

        // Hash the password before storing
        var user = _mapper.Map<User>(request.User);
        user.PasswordHash = _passwordHasher.Hash(request.User.Password);
        user.PhoneVerified = true; // Set to true since we verified it
        await _userRepo.AddAsync(user);
        
        return new RegisterUserResponse() { Success = true, UserName = user.Username };
    } 
}
