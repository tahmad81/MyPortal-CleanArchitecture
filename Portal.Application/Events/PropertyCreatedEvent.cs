using System;

namespace Portal.Application.Events
{
    public record PropertyCreatedEvent(
        Guid PropertyId,
        string Title,
        string Location,
        decimal Price,
        string AgentEmail);
}
