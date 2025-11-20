using AutoMapper;
using Portal.Application.Dtos;
using Portal.Core.Entities;
using System;
using System.Collections.Generic;

namespace Portal.Application.Mapping
{
    public class PropertyProfile : Profile
    {
        public PropertyProfile()
        {
            CreateMap<Property, PropertyDto>()
                .ForMember(dest => dest.Type, opt => opt.MapFrom(src => src.Type.ToString()))
                .ForMember(dest => dest.Category, opt => opt.MapFrom(src => src.Category.ToString()))
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.User != null ? src.User.Username : string.Empty))
                .ForMember(dest => dest.UserFullName, opt => opt.MapFrom(src => 
                    src.User != null 
                        ? (!string.IsNullOrWhiteSpace(src.User.FirstName) || !string.IsNullOrWhiteSpace(src.User.LastName)
                            ? $"{src.User.FirstName ?? ""} {src.User.LastName ?? ""}".Trim()
                            : string.Empty)
                        : string.Empty))
                .ForMember(dest => dest.Photos, opt => opt.MapFrom(src => src.Photos ?? new List<PropertyPhoto>()));

            CreateMap<PropertyPhoto, PropertyPhotoDto>()
                .ForMember(dest => dest.FileUrl, opt => opt.MapFrom(src => 
                    src.ImageData != null ? $"data:{src.ContentType};base64,{Convert.ToBase64String(src.ImageData)}" : string.Empty));

            CreateMap<CreatePropertyRequest, Property>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => Guid.NewGuid()))
                .ForMember(dest => dest.Type, opt => opt.MapFrom(src => (PropertyType)Enum.Parse(typeof(PropertyType), src.Type)))
                .ForMember(dest => dest.Category, opt => opt.MapFrom(src => (PropertyCategory)Enum.Parse(typeof(PropertyCategory), src.Category)))
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.IsActive, opt => opt.MapFrom(src => true))
                .ForMember(dest => dest.User, opt => opt.Ignore())
                .ForMember(dest => dest.Photos, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.ExpiryDate, opt => opt.Ignore());

            CreateMap<UpdatePropertyRequest, Property>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.UserId, opt => opt.Ignore())
                .ForMember(dest => dest.Type, opt => opt.Ignore())
                .ForMember(dest => dest.Category, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.User, opt => opt.Ignore())
                .ForMember(dest => dest.Photos, opt => opt.Ignore());
        }
    }
}

