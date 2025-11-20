using Portal.Core.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Portal.Application.Interfaces
{
    public interface IPropertyRepository
    {
        Task<Property?> GetByIdAsync(Guid id);
        Task<IEnumerable<Property>> GetByUserIdAsync(Guid userId);
        Task<IEnumerable<Property>> GetAllAsync();
        Task<IEnumerable<Property>> SearchAsync(
            string? searchTerm = null,
            string? type = null,
            string? category = null,
            string? city = null,
            string? state = null,
            decimal? minPrice = null,
            decimal? maxPrice = null,
            int? minBedrooms = null,
            int? minBathrooms = null);
        Task<Property> AddAsync(Property property);
        Task<Property> UpdateAsync(Property property);
        Task<bool> DeleteAsync(Guid id);
        Task<PropertyPhoto> AddPhotoAsync(PropertyPhoto photo);
        Task<bool> DeletePhotoAsync(Guid photoId);
        Task<PropertyPhoto?> GetPhotoByIdAsync(Guid photoId);
        Task<IEnumerable<PropertyPhoto>> GetPhotosByPropertyIdAsync(Guid propertyId);
        Task IncrementViewCountAsync(Guid propertyId);
    }
}

