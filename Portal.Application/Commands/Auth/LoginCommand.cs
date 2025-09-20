using MediatR;
using Portal.Application.Dtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Application.Commands.Auth
{
    public record LoginCommand(string Username, string Password) : IRequest<AuthResponse>;
}
