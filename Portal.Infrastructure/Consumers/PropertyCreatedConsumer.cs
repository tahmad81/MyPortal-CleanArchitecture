using MassTransit;
using Microsoft.Extensions.Logging;
using Portal.Application.Events;

namespace Portal.Infrastructure.Consumers
{
    public class PropertyCreatedConsumer : IConsumer<PropertyCreatedEvent>
    {
        private readonly ILogger<PropertyCreatedConsumer> _logger;

        public PropertyCreatedConsumer(ILogger<PropertyCreatedConsumer> logger)
        {
            _logger = logger;
        }

        public async Task Consume(ConsumeContext<PropertyCreatedEvent> context)
        {
            var message = context.Message;

            _logger.LogInformation(
                "Received PropertyCreatedEvent: PropertyId={PropertyId}, Title={Title}, AgentEmail={AgentEmail}",
                message.PropertyId,
                message.Title,
                message.AgentEmail);

            await Task.Delay(TimeSpan.FromSeconds(4), context.CancellationToken);

            _logger.LogInformation(
                "Finished processing PropertyCreatedEvent for agent {AgentEmail} on property {PropertyId}",
                message.AgentEmail,
                message.PropertyId);
        }
    }
}
