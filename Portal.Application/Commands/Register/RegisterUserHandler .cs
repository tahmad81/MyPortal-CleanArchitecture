
using AutoMapper;
using MediatR;
using Portal.Application.Commands.Register;
using Portal.Application.Dtos;
using Portal.Application.Interfaces;
using Portal.Core.Entities;
using System.Security.Cryptography;
using System.Text;

namespace Application.Features.Users.Handlers;

public class RegisterUserHandler : IRequestHandler<RegisterUserCommand, BaseResponse>
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

    public async Task<BaseResponse> Handle(RegisterUserCommand request, CancellationToken cancellationToken)
    {
        var existingUser = await _userRepo.GetByEmailAsync(request.User.Email);
        if (existingUser is not null)
            return new RegisterUserResponse() { Success = true, Message = "User already exist!"};
        // Hash the password before storing
        var user = _mapper.Map<User>(request.User);
        user.PasswordHash = _passwordHasher.Hash(request.User.Password);
        await _userRepo.AddAsync(user);
        return new RegisterUserResponse() { Success = true , UserName = user.Username};
    } 

    
}
