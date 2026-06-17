using System;
using System.Linq;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;
using System.Diagnostics;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Serilog;

namespace PortalAPI.Middleware
{
    public class ExceptionHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionHandlingMiddleware> _logger;

        public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                // Determine method and class from exception target site or stack trace
                var methodName = ex.TargetSite?.Name;
                var className = ex.TargetSite?.DeclaringType?.FullName;

                if (string.IsNullOrEmpty(methodName) || string.IsNullOrEmpty(className))
                {
                    var st = new StackTrace(ex, true);
                    var frame = st.GetFrames()?.FirstOrDefault(f =>
                    {
                        var m = f.GetMethod();
                        return m != null && m.DeclaringType != typeof(ExceptionHandlingMiddleware);
                    });
                    if (frame != null)
                    {
                        methodName ??= frame.GetMethod()?.Name;
                        className ??= frame.GetMethod()?.DeclaringType?.FullName;
                    }
                }

                var timestampUtc = DateTime.UtcNow;
                var requestPath = context.Request?.Path.Value ?? "<unknown>";
                var user = context.User?.Identity?.IsAuthenticated == true ? context.User.Identity.Name : "anonymous";

                // Log using ILogger (which forwards to Serilog when configured)
                _logger.LogError(ex, "Unhandled exception in {Class}.{Method} at {TimestampUtc} for request {RequestPath} by {User}", className ?? "UnknownClass", methodName ?? "UnknownMethod", timestampUtc, requestPath, user);

               

                if (!context.Response.HasStarted)
                {
                    context.Response.Clear();
                    context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                    context.Response.ContentType = "application/json";
                    var payload = JsonSerializer.Serialize(new { message = "server error" });
                    await context.Response.WriteAsync(payload);
                }
            }
        }
    }
}
