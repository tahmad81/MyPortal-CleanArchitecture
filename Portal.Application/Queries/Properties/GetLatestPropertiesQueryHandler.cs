using AutoMapper;
using MediatR;
using Portal.Application.Dtos;
using Portal.Application.Interfaces;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Portal.Application.Queries.Properties
{
    public class GetLatestPropertiesQueryHandler : IRequestHandler<GetLatestPropertiesQuery, BaseResponse<List<PropertyDto>>>
    {
        private readonly IPropertyRepository _propertyRepository;
        private readonly IMapper _mapper;

        public GetLatestPropertiesQueryHandler(
            IPropertyRepository propertyRepository,
            IMapper mapper)
        {
            _propertyRepository = propertyRepository;
            _mapper = mapper;
        }

        public async Task<BaseResponse<List<PropertyDto>>> Handle(GetLatestPropertiesQuery request, CancellationToken cancellationToken)
        {
            var properties = await _propertyRepository.GetAllAsync();
            var latestProperties = properties
                .OrderByDescending(p => p.CreatedAt)
                .Take(request.Count)
                .ToList();

            var propertyDtos = _mapper.Map<List<PropertyDto>>(latestProperties);

            return BaseResponse<List<PropertyDto>>.SuccessResult(propertyDtos, "Latest properties retrieved successfully.");
        }
    }
}


