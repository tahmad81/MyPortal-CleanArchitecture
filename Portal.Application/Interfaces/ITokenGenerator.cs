using Portal.Core.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Application.Interfaces
{
    public interface ITokenGenerator
    {
        string GenerateToken(User user);

    }
}
