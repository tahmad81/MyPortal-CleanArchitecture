using MediatR;
using Portal.Application.Dtos;
using Portal.Application.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Application.Commands.Auth
{
    public class LoginCommandHandler : IRequestHandler<LoginCommand, AuthResponse>
    {
        private readonly IUserRepository _userRepository;
        private readonly ITokenGenerator _jwtTokenGenerator;
        private readonly IPasswordHasher _passwordHasher;
        public LoginCommandHandler(IUserRepository userRepository, ITokenGenerator jwtTokenGenerator, IPasswordHasher passwordHasher)
        {
            _userRepository = userRepository;
            _jwtTokenGenerator = jwtTokenGenerator;
            _passwordHasher = passwordHasher;
        }
        public async Task<AuthResponse> Handle(LoginCommand request, CancellationToken cancellationToken)
        {
            var user = await _userRepository.GetByUserNameAsync(request.Username);

            if (user == null || !_passwordHasher.Verify(request.Password, user.PasswordHash))
            {
                throw new UnauthorizedAccessException("Invalid credentials.");
            }
            var token = _jwtTokenGenerator.GenerateToken(user);
            return new AuthResponse() { UserName = request.Username, Token = token, Success = true, Message = "Login Successfull", UserId = user.Id };
        }
    }
}
