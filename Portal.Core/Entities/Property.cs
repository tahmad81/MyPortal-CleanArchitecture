using System;
using System.Collections.Generic;

namespace Portal.Core.Entities
{
    public class Property
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public User User { get; set; } = null!;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public PropertyType Type { get; set; } // Rent or Sale
        public PropertyCategory Category { get; set; } // House, Apartment, Land, etc.
        public decimal Price { get; set; }
        public string Address { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string State { get; set; } = string.Empty;
        public string ZipCode { get; set; } = string.Empty;
        public string Country { get; set; } = string.Empty;
        
        // Property Details
        public int? Bedrooms { get; set; }
        public int? Bathrooms { get; set; }
        public decimal? Area { get; set; } // in square feet/meters
        public string? AreaUnit { get; set; } // sqft, sqm
        
        // Additional fields
        public int? YearBuilt { get; set; }
        public string? Parking { get; set; }
        public string? FurnishingStatus { get; set; } // Furnished, Semi-Furnished, Unfurnished
        public string? ContactNumber { get; set; } // Contact number for property
        
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        
        // Navigation property
        public ICollection<PropertyPhoto> Photos { get; set; } = new List<PropertyPhoto>();
    }

    public enum PropertyType
    {
        Rent = 1,
        Sale = 2
    }

    public enum PropertyCategory
    {
        House = 1,
        Apartment = 2,
        Villa = 3,
        Land = 4,
        Commercial = 5,
        Other = 6
    }
}

