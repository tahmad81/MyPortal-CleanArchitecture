using AutoMapper;
using MediatR;
using Portal.Application.Dtos;
using Portal.Application.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Portal.Application.Commands.Properties
{
    public class UpdatePropertyCommandHandler : IRequestHandler<UpdatePropertyCommand, BaseResponse<PropertyDto>>
    {
        private readonly IPropertyRepository _propertyRepository;
        private readonly IMapper _mapper;

        public UpdatePropertyCommandHandler(
            IPropertyRepository propertyRepository,
            IMapper mapper)
        {
            _propertyRepository = propertyRepository;
            _mapper = mapper;
        }

        public async Task<BaseResponse<PropertyDto>> Handle(UpdatePropertyCommand request, CancellationToken cancellationToken)
        {
            // Get existing property
            var existingProperty = await _propertyRepository.GetByIdAsync(request.PropertyId);

            if (existingProperty == null)
            {
                return BaseResponse<PropertyDto>.Failure("Property not found.");
            }

            // Verify ownership
            if (existingProperty.UserId != request.UserId)
            {
                return BaseResponse<PropertyDto>.Failure("You do not have permission to update this property.");
            }

            // Map update request to existing property
            _mapper.Map(request.Request, existingProperty);
            existingProperty.UpdatedAt = DateTime.UtcNow;

            // Handle photos: if Photos is not null, process it (empty array = delete all, non-empty = replace)
            if (request.Request.Photos != null)
            {
                // Delete existing photos
                var existingPhotos = await _propertyRepository.GetPhotosByPropertyIdAsync(existingProperty.Id);
                foreach (var photo in existingPhotos)
                {
                    await _propertyRepository.DeletePhotoAsync(photo.Id);
                }

                // Add new photos if provided
                if (request.Request.Photos.Any())
                {
                    var newPhotos = new List<Portal.Core.Entities.PropertyPhoto>();
                    foreach (var photoRequest in request.Request.Photos)
                    {
                        var photo = new Portal.Core.Entities.PropertyPhoto
                        {
                            Id = Guid.NewGuid(),
                            PropertyId = existingProperty.Id,
                            FileName = photoRequest.FileName,
                            ImageData = photoRequest.ImageData,
                            ContentType = photoRequest.ContentType,
                            FileSize = photoRequest.ImageData.Length,
                            DisplayOrder = photoRequest.DisplayOrder,
                            IsPrimary = photoRequest.IsPrimary,
                            UploadedAt = DateTime.UtcNow
                        };
                        newPhotos.Add(photo);
                        await _propertyRepository.AddPhotoAsync(photo);
                    }
                    existingProperty.Photos = newPhotos;
                }
                else
                {
                    // Empty array - all photos deleted
                    existingProperty.Photos = new List<Portal.Core.Entities.PropertyPhoto>();
                }
            }
            // If Photos is null, keep existing photos unchanged

            // Update property
            var updatedProperty = await _propertyRepository.UpdateAsync(existingProperty);
            var propertyWithRelations = await _propertyRepository.GetByIdAsync(updatedProperty.Id);

            if (propertyWithRelations == null)
            {
                return BaseResponse<PropertyDto>.Failure("Property was updated but could not be retrieved.");
            }

            var propertyDto = _mapper.Map<PropertyDto>(propertyWithRelations);

            return BaseResponse<PropertyDto>.SuccessResult(propertyDto, "Property updated successfully.");
        }
    }
}

