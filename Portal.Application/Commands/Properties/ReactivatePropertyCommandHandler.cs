using AutoMapper;
using MediatR;
using Microsoft.Extensions.Configuration;
using Portal.Application.Dtos;
using Portal.Application.Interfaces;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Portal.Application.Commands.Properties
{
    public class ReactivatePropertyCommandHandler : IRequestHandler<ReactivatePropertyCommand, BaseResponse<PropertyDto>>
    {
        private readonly IPropertyRepository _propertyRepository;
        private readonly IMapper _mapper;
        private readonly IConfiguration _configuration;

        public ReactivatePropertyCommandHandler(
            IPropertyRepository propertyRepository,
            IMapper mapper,
            IConfiguration configuration)
        {
            _propertyRepository = propertyRepository;
            _mapper = mapper;
            _configuration = configuration;
        }

        public async Task<BaseResponse<PropertyDto>> Handle(ReactivatePropertyCommand request, CancellationToken cancellationToken)
        {
            var property = await _propertyRepository.GetByIdAsync(request.PropertyId);

            if (property == null)
            {
                return BaseResponse<PropertyDto>.Failure("Property not found.");
            }

            // Verify ownership
            if (property.UserId != request.UserId)
            {
                return BaseResponse<PropertyDto>.Failure("You do not have permission to reactivate this property.");
            }

            // Check if already active
            if (!property.IsRemoved)
            {
                return BaseResponse<PropertyDto>.Failure("Property is already active.");
            }

            // Restore original expiry date or set new one if original is in the past
            var expiryDays = _configuration.GetValue<int>("Property:ExpiryDays", 30);
            var today = DateTime.UtcNow;
            
            if (property.OriginalExpiryDate.HasValue && property.OriginalExpiryDate.Value > today)
            {
                // Use original expiry date if it's still in the future
                property.ExpiryDate = property.OriginalExpiryDate.Value;
            }
            else
            {
                // Set new expiry date from today
                property.ExpiryDate = today.AddDays(expiryDays);
            }

            // Reactivate property
            property.IsRemoved = false;
            property.RemovedDate = null;
            property.RemoveReason = null;
            property.OriginalExpiryDate = null;
            property.UpdatedAt = DateTime.UtcNow;

            var updatedProperty = await _propertyRepository.UpdateAsync(property);
            var propertyWithRelations = await _propertyRepository.GetByIdAsync(updatedProperty.Id);

            if (propertyWithRelations == null)
            {
                return BaseResponse<PropertyDto>.Failure("Property was updated but could not be retrieved.");
            }

            var propertyDto = _mapper.Map<PropertyDto>(propertyWithRelations);

            return BaseResponse<PropertyDto>.SuccessResult(propertyDto, "Property reactivated successfully.");
        }
    }
}

