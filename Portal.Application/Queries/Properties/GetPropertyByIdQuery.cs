using MediatR;
using Portal.Application.Dtos;
using System;

namespace Portal.Application.Queries.Properties
{
    public class GetPropertyByIdQuery : IRequest<BaseResponse<PropertyDto>>
    {
        public Guid Id { get; set; }

        public GetPropertyByIdQuery(Guid id)
        {
            Id = id;
        }
    }
}

