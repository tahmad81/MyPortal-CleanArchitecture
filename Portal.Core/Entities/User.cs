using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Core.Entities
{
    public class User
    {
        public Guid Id { get; set; }   // Primary Key
        public string Username { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty; // store hashed password
        public string Email { get; set; } = "User";


    }
}
