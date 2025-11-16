using System;

namespace Portal.Core.Entities
{
    public class PropertyPhoto
    {
        public Guid Id { get; set; }
        public Guid PropertyId { get; set; }
        public Property Property { get; set; } = null!;
        public string FileName { get; set; } = string.Empty;
        public string FilePath { get; set; } = string.Empty;
        public byte[]? ImageData { get; set; } // Store image as byte array in DB
        public long FileSize { get; set; }
        public string ContentType { get; set; } = string.Empty;
        public int DisplayOrder { get; set; } = 0;
        public bool IsPrimary { get; set; } = false;
        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
    }
}

