using MediatR;
using Portal.Application.Dtos;
using System;
using System.Collections.Generic;

namespace Portal.Application.Queries.Properties
{
    public class GetUserPropertiesQuery : IRequest<BaseResponse<List<PropertyDto>>>
    {
        public Guid UserId { get; }

        public GetUserPropertiesQuery(Guid userId)
        {
            UserId = userId;
        }
    }
}

