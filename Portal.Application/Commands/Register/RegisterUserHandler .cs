
using AutoMapper;
using MediatR;
using Portal.Application.Commands.Register;
using Portal.Application.Interfaces;
using Portal.Core.Entities;
using System.Security.Cryptography;
using System.Text;

namespace Application.Features.Users.Handlers;

public class RegisterUserHandler : IRequestHandler<RegisterUserCommand, string>
{
    private readonly IUserRepository _userRepo;
    private readonly IMapper _mapper;
    private readonly IPasswordHasher _passwordHasher;
    public RegisterUserHandler(IUserRepository userRepo, IMapper mapper,
        IPasswordHasher passwordHasher)
    {
        _userRepo = userRepo;
        _mapper= mapper;
        _passwordHasher = passwordHasher;
    }

    public async Task<string> Handle(RegisterUserCommand request, CancellationToken cancellationToken)
    {
        var existingUser = await _userRepo.GetByEmailAsync(request.User.Email);
        if (existingUser is not null)
            return "Email already registered";
        // Hash the password before storing
        var user = _mapper.Map<User>(request.User);
        user.PasswordHash = _passwordHasher.Hash(request.User.Password);
        await _userRepo.AddAsync(user); 
        return user.Id.ToString();
    }

    
}
