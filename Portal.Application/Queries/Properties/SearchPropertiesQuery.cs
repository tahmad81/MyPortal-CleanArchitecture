using MediatR;
using Portal.Application.Dtos;
using System.Collections.Generic;

namespace Portal.Application.Queries.Properties
{
    public class SearchPropertiesQuery : IRequest<BaseResponse<List<PropertyDto>>>
    {
        public string? SearchTerm { get; set; }
        public string? Type { get; set; } // Rent or Sale
        public string? Category { get; set; }
        public string? City { get; set; }
        public string? State { get; set; }
        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }
        public int? MinBedrooms { get; set; }
        public int? MinBathrooms { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 20;
    }
}


