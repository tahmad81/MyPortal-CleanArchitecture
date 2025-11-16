namespace Portal.Application.Dtos
{
    public class UploadPhotoRequest
    {
        public Guid PropertyId { get; set; }
        public byte[] ImageData { get; set; } = Array.Empty<byte>();
        public string FileName { get; set; } = string.Empty;
        public string ContentType { get; set; } = string.Empty;
        public int DisplayOrder { get; set; }
        public bool IsPrimary { get; set; }
    }
}


