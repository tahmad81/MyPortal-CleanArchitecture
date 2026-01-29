using Application.Dtos;
using AutoMapper;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Portal.Application.Commands.Auth;
using Portal.Application.Commands.Register;
using Portal.Application.Dtos;
using Portal.Application.Services;
using Portal.Core.Entities;

namespace PortalAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly IMapper _mapper;
        private readonly IEmailOtpService _emailOtpService;

        public AuthController(IMediator mediator, IMapper mapper, IEmailOtpService emailOtpService)
        {
            _mediator = mediator;
            _mapper = mapper;
            _emailOtpService = emailOtpService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterUserRequest request)
        {
            // Mapping at API level
            var user = _mapper.Map<User>(request);

            // Pass entity into command
            var command = new RegisterUserCommand(request);

            var userResponse = await _mediator.Send(command);

            return Ok(userResponse);
        }
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {


            // Pass entity into command...

            var command = new LoginCommand(request.UserName, request.Password);

            var userResponse = await _mediator.Send(command);

            return Ok(userResponse);
        }

        [HttpPost("send-email-otp")]
        public async Task<IActionResult> SendEmailOtp([FromBody] SendEmailOtpRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email))
            {
                return BadRequest(new { success = false, message = "Email is required." });
            }

            try
            {
                await _emailOtpService.GenerateAndSendOtpAsync(request.Email);
                return Ok(new { success = true, message = "OTP sent to your email address." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPost("verify-email-otp")]
        public async Task<IActionResult> VerifyEmailOtp([FromBody] VerifyEmailOtpRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Otp))
            {
                return BadRequest(new { success = false, message = "Email and OTP are required." });
            }

            var isValid = await _emailOtpService.VerifyOtpAsync(request.Email, request.Otp);
            
            if (isValid)
            {
                return Ok(new { success = true, message = "Email verified successfully." });
            }
            else
            {
                return BadRequest(new { success = false, message = "Invalid or expired OTP." });
            }
        }
    }

    public class SendEmailOtpRequest
    {
        public string Email { get; set; } = string.Empty;
    }

    public class VerifyEmailOtpRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Otp { get; set; } = string.Empty;
    }
}
