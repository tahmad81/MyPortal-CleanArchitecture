using AutoMapper;
using MediatR;
using Portal.Application.Dtos;
using Portal.Application.Interfaces;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Portal.Application.Queries.Properties
{
    public class GetPropertyByIdQueryHandler : IRequestHandler<GetPropertyByIdQuery, BaseResponse<PropertyDto>>
    {
        private readonly IPropertyRepository _propertyRepository;
        private readonly IMapper _mapper;

        public GetPropertyByIdQueryHandler(
            IPropertyRepository propertyRepository,
            IMapper mapper)
        {
            _propertyRepository = propertyRepository;
            _mapper = mapper;
        }

        public async Task<BaseResponse<PropertyDto>> Handle(GetPropertyByIdQuery request, CancellationToken cancellationToken)
        {
            var property = await _propertyRepository.GetByIdAsync(request.Id);

            if (property == null)
            {
                return BaseResponse<PropertyDto>.Failure("Property not found.");
            }

            var propertyDto = _mapper.Map<PropertyDto>(property);
            return BaseResponse<PropertyDto>.SuccessResult(propertyDto, "Property retrieved successfully.");
        }
    }
}

