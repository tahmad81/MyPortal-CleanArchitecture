using AutoMapper;
using MediatR;
using Portal.Application.Dtos;
using Portal.Application.Interfaces;
using Portal.Core.Entities;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Portal.Application.Commands.Properties
{
    public class CreatePropertyCommandHandler : IRequestHandler<CreatePropertyCommand, BaseResponse<PropertyDto>>
    {
        private readonly IPropertyRepository _propertyRepository;
        private readonly IMapper _mapper;

        public CreatePropertyCommandHandler(
            IPropertyRepository propertyRepository,
            IMapper mapper)
        {
            _propertyRepository = propertyRepository;
            _mapper = mapper;
        }

        public async Task<BaseResponse<PropertyDto>> Handle(CreatePropertyCommand request, CancellationToken cancellationToken)
        {
            // Get user by ID from database - need to check how User ID is stored
            // For now, we'll just create the property with the provided UserId
            var property = _mapper.Map<Property>(request.Request);
            property.UserId = request.UserId;

            // Add photos if provided
            if (request.Request.Photos != null && request.Request.Photos.Any())
            {
                var photos = new List<Portal.Core.Entities.PropertyPhoto>();
                foreach (var photoRequest in request.Request.Photos)
                {
                    var photo = new Portal.Core.Entities.PropertyPhoto
                    {
                        Id = Guid.NewGuid(),
                        PropertyId = property.Id,
                        FileName = photoRequest.FileName,
                        ImageData = photoRequest.ImageData,
                        ContentType = photoRequest.ContentType,
                        FileSize = photoRequest.ImageData.Length,
                        DisplayOrder = photoRequest.DisplayOrder,
                        IsPrimary = photoRequest.IsPrimary,
                        UploadedAt = DateTime.UtcNow
                    };
                    photos.Add(photo);
                }
                property.Photos = photos;
            }

            var createdProperty = await _propertyRepository.AddAsync(property);
            var propertyWithRelations = await _propertyRepository.GetByIdAsync(createdProperty.Id);
            
            if (propertyWithRelations == null)
            {
                return BaseResponse<PropertyDto>.Failure("Property was created but could not be retrieved.");
            }

            var propertyDto = _mapper.Map<PropertyDto>(propertyWithRelations);

            return BaseResponse<PropertyDto>.SuccessResult(propertyDto, "Property created successfully.");
        }
    }
}

