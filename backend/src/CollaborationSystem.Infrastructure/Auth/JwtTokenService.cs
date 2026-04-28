using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using CollaborationSystem.Application.Abstractions;
using CollaborationSystem.Application.Auth;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace CollaborationSystem.Infrastructure.Auth;

public sealed class JwtTokenService(IConfiguration configuration) : IJwtTokenService
{
    private const int DefaultAccessTokenLifetimeMinutes = 15;

    public AccessToken CreateAccessToken(DevUser user)
    {
        var jwtSection = configuration.GetSection("Jwt");
        var issuer = jwtSection["Issuer"];
        var audience = jwtSection["Audience"];
        var signingKey = jwtSection["Key"]
            ?? throw new InvalidOperationException("Jwt:Key is not configured.");
        var lifetimeMinutes = int.TryParse(jwtSection["AccessTokenLifetimeMinutes"], out var configuredLifetimeMinutes)
            ? configuredLifetimeMinutes
            : DefaultAccessTokenLifetimeMinutes;

        var now = DateTime.UtcNow;
        var expiresAt = now.AddMinutes(lifetimeMinutes);
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.DisplayName),
            new Claim("domain_login", user.DomainLogin),
            new Claim("auth_mode", "DevLogin")
        };

        var credentials = new SigningCredentials(
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(signingKey)),
            SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            notBefore: now,
            expires: expiresAt,
            signingCredentials: credentials);

        var tokenValue = new JwtSecurityTokenHandler().WriteToken(token);

        return new AccessToken(
            tokenValue,
            (int)TimeSpan.FromMinutes(lifetimeMinutes).TotalSeconds);
    }
}
