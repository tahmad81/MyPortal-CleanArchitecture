using MediatR;
using Portal.Application.Dtos;
using System;

namespace Portal.Application.Commands.Properties
{
    public class UpdatePropertyCommand : IRequest<BaseResponse<PropertyDto>>
    {
        public Guid PropertyId { get; }
        public Guid UserId { get; }
        public UpdatePropertyRequest Request { get; }

        public UpdatePropertyCommand(Guid propertyId, Guid userId, UpdatePropertyRequest request)
        {
            PropertyId = propertyId;
            UserId = userId;
            Request = request;
        }
    }
}

