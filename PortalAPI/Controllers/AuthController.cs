using Application.Dtos;
using AutoMapper;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Portal.Application.Commands.Auth;
using Portal.Application.Commands.Register;
using Portal.Application.Dtos;
using Portal.Core.Entities;

namespace PortalAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly IMapper _mapper;

        public AuthController(IMediator mediator, IMapper mapper)
        {
            _mediator = mediator;
            _mapper = mapper;
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
    }
}
