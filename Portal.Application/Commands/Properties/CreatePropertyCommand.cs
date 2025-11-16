using MediatR;
using Portal.Application.Dtos;

namespace Portal.Application.Commands.Properties
{
    public class CreatePropertyCommand : IRequest<BaseResponse<PropertyDto>>
    {
        public CreatePropertyRequest Request { get; }
        public Guid UserId { get; }

        public CreatePropertyCommand(CreatePropertyRequest request, Guid userId)
        {
            Request = request;
            UserId = userId;
        }
    }
}

