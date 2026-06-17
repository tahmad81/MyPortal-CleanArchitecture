using MassTransit;
using Microsoft.Extensions.Logging;
using Portal.Application.Events;
using Portal.Application.Services;

namespace Portal.Infrastructure.Consumers
{
    public class PropertyCreatedConsumer : IConsumer<PropertyCreatedEvent>
    {
        private readonly ILogger<PropertyCreatedConsumer> _logger;
        private readonly IEmailService _emailService;
        private const string AdminEmail = "tauseef-ahmad@hotmai.com";

        public PropertyCreatedConsumer(
            ILogger<PropertyCreatedConsumer> logger,
            IEmailService emailService)
        {
            _logger = logger;
            _emailService = emailService;
        }

        public async Task Consume(ConsumeContext<PropertyCreatedEvent> context)
        {
            var message = context.Message;

            _logger.LogInformation(
                "Received PropertyCreatedEvent: PropertyId={PropertyId}, Title={Title}, AgentEmail={AgentEmail}",
                message.PropertyId,
                message.Title,
                message.AgentEmail);

            var subject = $"New Property Added: {message.Title}";
            var body = $@"
                <html>
                    <body style='font-family: Arial, sans-serif; color: #333;'>
                        <h2>New Property Added</h2>
                        <p>A new property has been added to the portal. Details are below:</p>
                        <ul>
                            <li><strong>Property ID:</strong> {message.PropertyId}</li>
                            <li><strong>Title:</strong> {message.Title}</li>
                            <li><strong>Location:</strong> {message.Location}</li>
                            <li><strong>Price:</strong> {message.Price:C}</li>
                            <li><strong>Agent Email:</strong> {message.AgentEmail}</li>
                        </ul>
                    </body>
                </html>";

            try
            {
                await _emailService.SendEmailAsync(AdminEmail, subject, body);
                _logger.LogInformation("Admin notification email sent to {AdminEmail} for PropertyId={PropertyId}", AdminEmail, message.PropertyId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send admin notification for PropertyId={PropertyId}", message.PropertyId);
            }

            await Task.Delay(TimeSpan.FromSeconds(4), context.CancellationToken);

            _logger.LogInformation(
                "Finished processing PropertyCreatedEvent for agent {AgentEmail} on property {PropertyId}",
                message.AgentEmail,
                message.PropertyId);
        }
    }
}
