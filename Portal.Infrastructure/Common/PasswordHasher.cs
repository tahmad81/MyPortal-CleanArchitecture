using Portal.Application.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Infrastructure.Common
{
    internal class PasswordHasher : IPasswordHasher
    {
        public string Hash(string password)
        {
            using var sha = SHA256.Create();
            var bytes = sha.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(bytes);
        }
        public bool Verify(string password, string storedHash)
        {
            using var sha = SHA256.Create();
            var bytes = sha.ComputeHash(Encoding.UTF8.GetBytes(password));
            var hash = Convert.ToBase64String(bytes);

            return hash == storedHash;
        }
    }
}
