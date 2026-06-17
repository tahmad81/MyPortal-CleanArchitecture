using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MassTransit;
using Portal.Application.Events;
using Portal.Application.Commands.Properties;
using Portal.Application.Dtos;
using Portal.Application.Queries.Properties;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace PortalAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PropertiesController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly IPublishEndpoint _publishEndpoint;

        public PropertiesController(IMediator mediator, IPublishEndpoint publishEndpoint)
        {
            _mediator = mediator;
            _publishEndpoint = publishEndpoint;
        }

        [HttpGet("latest")]
        [AllowAnonymous]
        public async Task<IActionResult> GetLatest([FromQuery] int count = 20)
        {
            var query = new GetLatestPropertiesQuery(count);
            var result = await _mediator.Send(query);
            return Ok(result);
        }

        [HttpGet("search")]
        [AllowAnonymous]
        public async Task<IActionResult> Search([FromQuery] SearchPropertiesQuery query)
        {
            var result = await _mediator.Send(query);
            return Ok(result);
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetById(Guid id)
        {
            var query = new GetPropertyByIdQuery(id);
            var result = await _mediator.Send(query);
            
            if (!result.Success)
            {
                return NotFound(result);
            }
            
            return Ok(result);
        }

        [HttpGet("my-ads")]
        [Authorize]
        public async Task<IActionResult> GetMyAds()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                ?? User.FindFirst("sub")?.Value;
            
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized("User ID not found in token.");
            }

            var query = new GetUserPropertiesQuery(userId);
            var result = await _mediator.Send(query);
            
            return Ok(result);
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateProperty([FromBody] CreatePropertyRequest request)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                ?? User.FindFirst("sub")?.Value;
            
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized("User ID not found in token.");
            }

            var command = new CreatePropertyCommand(request, userId);
            var result = await _mediator.Send(command);
            
            if (!result.Success)
            {
                return BadRequest(result);
            }

            var property = result.Data!;
            var agentEmail = User.FindFirst(ClaimTypes.Email)?.Value ?? string.Empty;

            var propertyCreatedEvent = new PropertyCreatedEvent(
                property.Id,
                property.Title,
                $"{property.Address}, {property.City}, {property.State}, {property.Country}",
                property.Price,
                agentEmail);

            _ = _publishEndpoint.Publish(propertyCreatedEvent);

            return CreatedAtAction(nameof(GetMyAds), new { id = result.Data?.Id }, result);
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateProperty(Guid id, [FromBody] UpdatePropertyRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                ?? User.FindFirst("sub")?.Value;
            
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized("User ID not found in token.");
            }

            var command = new UpdatePropertyCommand(id, userId, request);
            var result = await _mediator.Send(command);
            
            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        [HttpPost("{id}/remove")]
        [Authorize]
        public async Task<IActionResult> RemoveProperty(Guid id, [FromBody] RemovePropertyRequest request)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                ?? User.FindFirst("sub")?.Value;
            
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized("User ID not found in token.");
            }

            var command = new RemovePropertyCommand(id, userId, request.RemoveReason);
            var result = await _mediator.Send(command);
            
            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        [HttpPost("{id}/reactivate")]
        [Authorize]
        public async Task<IActionResult> ReactivateProperty(Guid id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                ?? User.FindFirst("sub")?.Value;
            
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized("User ID not found in token.");
            }

            var command = new ReactivatePropertyCommand(id, userId);
            var result = await _mediator.Send(command);
            
            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }
    }

    public class RemovePropertyRequest
    {
        public string RemoveReason { get; set; } = string.Empty;
    }
}

