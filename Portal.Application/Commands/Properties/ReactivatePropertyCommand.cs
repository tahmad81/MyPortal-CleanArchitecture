using MediatR;
using Portal.Application.Dtos;

namespace Portal.Application.Commands.Properties
{
    public class ReactivatePropertyCommand : IRequest<BaseResponse<PropertyDto>>
    {
        public Guid PropertyId { get; }
        public Guid UserId { get; }

        public ReactivatePropertyCommand(Guid propertyId, Guid userId)
        {
            PropertyId = propertyId;
            UserId = userId;
        }
    }
}

