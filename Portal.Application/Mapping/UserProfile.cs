using Application.Dtos;
using AutoMapper;
using Portal.Core.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Application.Mapping
{
    public class UserProfile : Profile
    {
        public UserProfile()
        {
            CreateMap<User, RegisterUserRequest>();
            CreateMap<RegisterUserRequest, User>();
        ;
        }
    }
}
