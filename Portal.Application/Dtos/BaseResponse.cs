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

    public class BaseResponse<T> : BaseResponse
    {
        public T? Data { get; set; }

        public static BaseResponse<T> SuccessResult(T data, string message = "")
        {
            return new BaseResponse<T>
            {
                Success = true,
                Message = message,
                Data = data
            };
        }

        public static BaseResponse<T> Failure(string message)
        {
            return new BaseResponse<T>
            {
                Success = false,
                Message = message
            };
        }
    }
}
