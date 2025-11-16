using MediatR;
using Portal.Application.Dtos;
using System.Collections.Generic;

namespace Portal.Application.Queries.Users
{
    public record GetUsersQuery() : IRequest<IEnumerable<UserSummaryDto>>;
}

