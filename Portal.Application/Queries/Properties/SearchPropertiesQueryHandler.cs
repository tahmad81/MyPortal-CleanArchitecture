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
    public class SearchPropertiesQueryHandler : IRequestHandler<SearchPropertiesQuery, BaseResponse<List<PropertyDto>>>
    {
        private readonly IPropertyRepository _propertyRepository;
        private readonly IMapper _mapper;

        public SearchPropertiesQueryHandler(
            IPropertyRepository propertyRepository,
            IMapper mapper)
        {
            _propertyRepository = propertyRepository;
            _mapper = mapper;
        }

        public async Task<BaseResponse<List<PropertyDto>>> Handle(SearchPropertiesQuery request, CancellationToken cancellationToken)
        {
            var properties = await _propertyRepository.SearchAsync(
                searchTerm: request.SearchTerm,
                type: request.Type,
                category: request.Category,
                city: request.City,
                state: request.State,
                minPrice: request.MinPrice,
                maxPrice: request.MaxPrice,
                minBedrooms: request.MinBedrooms,
                minBathrooms: request.MinBathrooms);

            // Apply pagination
            var totalCount = properties.Count();
            var pagedProperties = properties
                .Skip((request.Page - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToList();

            var propertyDtos = _mapper.Map<List<PropertyDto>>(pagedProperties);

            return BaseResponse<List<PropertyDto>>.SuccessResult(propertyDtos, $"Found {totalCount} properties.");
        }
    }
}


