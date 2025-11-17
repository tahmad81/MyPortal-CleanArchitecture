using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;
using Portal.Application.Converters;

namespace Portal.Application.Dtos
{
    public class PropertyDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string UserFullName { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty; // Rent or Sale
        public string Category { get; set; } = string.Empty; // House, Apartment, etc.
        public decimal Price { get; set; }
        public string Address { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string State { get; set; } = string.Empty;
        public string ZipCode { get; set; } = string.Empty;
        public string Country { get; set; } = string.Empty;
        public int? Bedrooms { get; set; }
        public int? Bathrooms { get; set; }
        public decimal? Area { get; set; }
        public string? AreaUnit { get; set; }
        public int? YearBuilt { get; set; }
        public string? Parking { get; set; }
        public string? FurnishingStatus { get; set; }
        public string? ContactNumber { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public List<PropertyPhotoDto> Photos { get; set; } = new();
    }

    public class PropertyPhotoDto
    {
        public Guid Id { get; set; }
        public string FileName { get; set; } = string.Empty;
        public string FilePath { get; set; } = string.Empty;
        public string FileUrl { get; set; } = string.Empty;
        public byte[]? ImageData { get; set; } // Image data as base64 string or byte array
        public long FileSize { get; set; }
        public string ContentType { get; set; } = string.Empty;
        public int DisplayOrder { get; set; }
        public bool IsPrimary { get; set; }
    }

    public class PropertyPhotoRequest
    {
        public string FileName { get; set; } = string.Empty;
        
        // ByteArrayConverter is registered globally in Program.cs
        public byte[] ImageData { get; set; } = Array.Empty<byte>();
        
        public string ContentType { get; set; } = string.Empty;
        public int DisplayOrder { get; set; }
        public bool IsPrimary { get; set; }
    }

    public class CreatePropertyRequest
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty; // Rent or Sale
        public string Category { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string Address { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string State { get; set; } = string.Empty;
        public string ZipCode { get; set; } = string.Empty;
        public string Country { get; set; } = string.Empty;
        public int? Bedrooms { get; set; }
        public int? Bathrooms { get; set; }
        public decimal? Area { get; set; }
        public string? AreaUnit { get; set; }
        public int? YearBuilt { get; set; }
        public string? Parking { get; set; }
        public string? FurnishingStatus { get; set; }
        public string? ContactNumber { get; set; }
        public List<PropertyPhotoRequest>? Photos { get; set; }
    }

    public class UpdatePropertyRequest
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string Address { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string State { get; set; } = string.Empty;
        public string ZipCode { get; set; } = string.Empty;
        public string Country { get; set; } = string.Empty;
        public int? Bedrooms { get; set; }
        public int? Bathrooms { get; set; }
        public decimal? Area { get; set; }
        public string? AreaUnit { get; set; }
        public int? YearBuilt { get; set; }
        public string? Parking { get; set; }
        public string? FurnishingStatus { get; set; }
        public string? ContactNumber { get; set; }
        public bool IsActive { get; set; }
        public List<PropertyPhotoRequest>? Photos { get; set; }
    }
}

