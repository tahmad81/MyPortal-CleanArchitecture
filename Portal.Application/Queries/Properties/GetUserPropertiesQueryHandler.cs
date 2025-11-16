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
    public class GetUserPropertiesQueryHandler : IRequestHandler<GetUserPropertiesQuery, BaseResponse<List<PropertyDto>>>
    {
        private readonly IPropertyRepository _propertyRepository;
        private readonly IMapper _mapper;

        public GetUserPropertiesQueryHandler(IPropertyRepository propertyRepository, IMapper mapper)
        {
            _propertyRepository = propertyRepository;
            _mapper = mapper;
        }

        public async Task<BaseResponse<List<PropertyDto>>> Handle(GetUserPropertiesQuery request, CancellationToken cancellationToken)
        {
            var properties = await _propertyRepository.GetByUserIdAsync(request.UserId);
            var propertyDtos = properties.Select(p => _mapper.Map<PropertyDto>(p)).ToList();

            return BaseResponse<List<PropertyDto>>.SuccessResult(propertyDtos, "Properties retrieved successfully.");
        }
    }
}

