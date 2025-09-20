using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Application.Dtos
{
    public abstract class BaseResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = "";
        public string CorrelationId { get; set; }="";
        public DateTime RespondedAt { get; set; } = DateTime.UtcNow;
    }
}
