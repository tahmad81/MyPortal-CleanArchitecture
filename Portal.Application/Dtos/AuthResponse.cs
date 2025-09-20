using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Application.Dtos
{
    public class AuthResponse:BaseResponse
    {
        public string? Token { get; set; }         // JWT token
        public DateTime ExpiresAt { get; set; }   // Expiry time (UTC)
        public Guid UserId { get; set; }        // Optional: user id
        public string? Email { get; set; }
        public string? UserName { get; set; }  
        public IList<string>? Roles { get; set; }  // Optional: user roles

    }
}
