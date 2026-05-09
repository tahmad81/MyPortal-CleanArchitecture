using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Http;
using Portal.Application.Interfaces;
using Portal.Application.Services;
using Portal.Infrastructure.Common;
using Portal.Infrastructure.Persistence;
using Portal.Infrastructure.Persistence.Repositories;
using Portal.Infrastructure.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
        {
            //services.AddDbContext<AppDbContext>(options =>
            //    options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));

            services.AddDbContext<AppDbContext>(options =>
                options.UseMySql(
        configuration.GetConnectionString("MySqlConnection"),
        ServerVersion.AutoDetect(configuration.GetConnectionString("MySqlConnection"))
    ));
            services.AddScoped<IPasswordHasher, PasswordHasher>();
            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<IPropertyRepository, PropertyRepository>();
            services.AddScoped<ITokenGenerator, JwtTokenGenerator>();

            // Register reCAPTCHA service with HttpClient
            services.AddHttpClient<IRecaptchaService, RecaptchaService>();

            // Register Phone Verification service
            services.AddScoped<IPhoneVerificationService, PhoneVerificationService>();

            // Register Email services
            services.AddScoped<IEmailService, EmailService>();
            services.AddScoped<IEmailOtpService, EmailOtpService>();

            return services;
        }

    }
}
