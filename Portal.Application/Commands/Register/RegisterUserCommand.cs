using Application.Dtos;
using MediatR;
using Portal.Application.Dtos;
using Portal.Core.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Application.Commands.Register
{
    public class  RegisterUserCommand:IRequest<BaseResponse>
    {
        public RegisterUserRequest User { get; }

        public RegisterUserCommand(RegisterUserRequest user)
        {
            User = user;
        }
    }   
}
