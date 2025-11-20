using MediatR;
using Portal.Application.Dtos;

namespace Portal.Application.Commands.Properties
{
    public class RemovePropertyCommand : IRequest<BaseResponse<PropertyDto>>
    {
        public Guid PropertyId { get; }
        public Guid UserId { get; }
        public string RemoveReason { get; }

        public RemovePropertyCommand(Guid propertyId, Guid userId, string removeReason)
        {
            PropertyId = propertyId;
            UserId = userId;
            RemoveReason = removeReason;
        }
    }
}

