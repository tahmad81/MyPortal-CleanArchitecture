using MediatR;
using Portal.Application.Dtos;
using System.Collections.Generic;

namespace Portal.Application.Queries.Properties
{
    public class GetLatestPropertiesQuery : IRequest<BaseResponse<List<PropertyDto>>>
    {
        public int Count { get; set; } = 20;

        public GetLatestPropertiesQuery(int count = 20)
        {
            Count = count;
        }
    }
}


