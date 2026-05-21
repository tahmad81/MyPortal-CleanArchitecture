using Microsoft.EntityFrameworkCore;
using Portal.Application.Interfaces;
using EasyCaching.Core;
using Portal.Core.Entities;
using Portal.Infrastructure.Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Portal.Infrastructure.Persistence.Repositories
{
    public class PropertyRepository : IPropertyRepository
    {
        private readonly AppDbContext _context;
        private readonly IEasyCachingProvider _cache;

        public PropertyRepository(AppDbContext context, IEasyCachingProviderFactory cacheFactory)
        {
            _context = context;
            _cache = cacheFactory.GetCachingProvider("memcached1");
        }

        public async Task<Property?> GetByIdAsync(Guid id)
        {
            var key = $"property:{id}";
            var cached = await _cache.GetAsync<Property>(key);
            if (cached.HasValue)
            {
                return cached.Value;
            }

            var property = await _context.Properties
                .Include(p => p.User)
                .Include(p => p.Photos.OrderBy(ph => ph.DisplayOrder))
                .FirstOrDefaultAsync(p => p.Id == id);

            if (property != null)
            {
                await _cache.SetAsync(key, property, TimeSpan.FromMinutes(10));
            }

            return property;
        }

        public async Task<IEnumerable<Property>> GetByUserIdAsync(Guid userId)
        {
            var key = $"properties:user:{userId}";
            var cached = await _cache.GetAsync<List<Property>>(key);
            if (cached.HasValue)
            {
                return cached.Value;
            }

            var list = await _context.Properties
                .Include(p => p.User)
                .Include(p => p.Photos.OrderBy(ph => ph.DisplayOrder))
                .Where(p => p.UserId == userId)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();

            await _cache.SetAsync(key, list, TimeSpan.FromMinutes(5));
            return list;
        }

        public async Task<IEnumerable<Property>> GetAllAsync()
        {
            var now = DateTime.UtcNow;
            var key = "properties:all";
            var cached = await _cache.GetAsync<List<Property>>(key);
            if (cached.HasValue)
            {
                return cached.Value;
            }

            var list = await _context.Properties
                .Include(p => p.User)
                .Include(p => p.Photos.Where(ph => ph.IsPrimary))
                .Where(p => p.IsActive && !p.IsRemoved && p.ExpiryDate > now)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();

            await _cache.SetAsync(key, list, TimeSpan.FromMinutes(2));
            return list;
        }

        public async Task<IEnumerable<Property>> SearchAsync(
            string? searchTerm = null,
            string? type = null,
            string? category = null,
            string? city = null,
            string? state = null,
            decimal? minPrice = null,
            decimal? maxPrice = null,
            int? minBedrooms = null,
            int? minBathrooms = null)
        {
            var now = DateTime.UtcNow;
            var query = _context.Properties
                .Include(p => p.User)
                .Include(p => p.Photos.Where(ph => ph.IsPrimary))
                .Where(p => p.IsActive && !p.IsRemoved && p.ExpiryDate > now);

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                searchTerm = searchTerm.ToLower();
                query = query.Where(p => 
                    p.Title.ToLower().Contains(searchTerm) ||
                    p.Description.ToLower().Contains(searchTerm) ||
                    p.Address.ToLower().Contains(searchTerm) ||
                    p.City.ToLower().Contains(searchTerm));
            }

            if (!string.IsNullOrWhiteSpace(type))
            {
                if (Enum.TryParse<Portal.Core.Entities.PropertyType>(type, out var propertyType))
                {
                    query = query.Where(p => p.Type == propertyType);
                }
            }

            if (!string.IsNullOrWhiteSpace(category))
            {
                if (Enum.TryParse<Portal.Core.Entities.PropertyCategory>(category, out var propertyCategory))
                {
                    query = query.Where(p => p.Category == propertyCategory);
                }
            }

            if (!string.IsNullOrWhiteSpace(city))
            {
                query = query.Where(p => p.City.ToLower().Contains(city.ToLower()));
            }

            if (!string.IsNullOrWhiteSpace(state))
            {
                query = query.Where(p => p.State.ToLower().Contains(state.ToLower()));
            }

            if (minPrice.HasValue)
            {
                query = query.Where(p => p.Price >= minPrice.Value);
            }

            if (maxPrice.HasValue)
            {
                query = query.Where(p => p.Price <= maxPrice.Value);
            }

            if (minBedrooms.HasValue)
            {
                query = query.Where(p => p.Bedrooms.HasValue && p.Bedrooms >= minBedrooms.Value);
            }

            if (minBathrooms.HasValue)
            {
                query = query.Where(p => p.Bathrooms.HasValue && p.Bathrooms >= minBathrooms.Value);
            }

            return await query.OrderByDescending(p => p.CreatedAt).ToListAsync();
        }

        public async Task<Property> AddAsync(Property property)
        {
            _context.Properties.Add(property);
            await _context.SaveChangesAsync();
            return property;
        }

        public async Task<Property> UpdateAsync(Property property)
        {
            property.UpdatedAt = DateTime.UtcNow;
            _context.Properties.Update(property);
            await _context.SaveChangesAsync();
            return property;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var property = await _context.Properties.FindAsync(id);
            if (property == null)
                return false;

            _context.Properties.Remove(property);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<PropertyPhoto> AddPhotoAsync(PropertyPhoto photo)
        {
            _context.PropertyPhotos.Add(photo);
            await _context.SaveChangesAsync();
            return photo;
        }

        public async Task<bool> DeletePhotoAsync(Guid photoId)
        {
            var photo = await _context.PropertyPhotos.FindAsync(photoId);
            if (photo == null)
                return false;

            _context.PropertyPhotos.Remove(photo);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<PropertyPhoto?> GetPhotoByIdAsync(Guid photoId)
        {
            return await _context.PropertyPhotos.FindAsync(photoId);
        }

        public async Task<IEnumerable<PropertyPhoto>> GetPhotosByPropertyIdAsync(Guid propertyId)
        {
            return await _context.PropertyPhotos
                .Where(p => p.PropertyId == propertyId)
                .OrderBy(p => p.DisplayOrder)
                .ToListAsync();
        }

        public async Task IncrementViewCountAsync(Guid propertyId)
        {
            var property = await _context.Properties.FindAsync(propertyId);
            if (property != null)
            {
                property.ViewCount++;
                await _context.SaveChangesAsync();
            }
        }
    }
}

