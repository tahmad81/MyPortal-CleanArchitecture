using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Application.Dtos
{
    public class RegisterUserResponse : BaseResponse
    {
        public string UserName { get; set; } = "";  
    }
}
