using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using OmegaERP.Api.Data;
using OmegaERP.Api.DTOs;
using OmegaERP.Api.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace OmegaERP.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(
            AppDbContext context,
            IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        // Yeni kullanıcı oluşturur.
        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto request)
        {
            // Zorunlu alan kontrolleri.
            if (string.IsNullOrWhiteSpace(request.FullName))
            {
                return BadRequest("Ad soyad boş bırakılamaz.");
            }

            if (string.IsNullOrWhiteSpace(request.Email))
            {
                return BadRequest("E-posta adresi boş bırakılamaz.");
            }

            if (string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest("Şifre boş bırakılamaz.");
            }

            if (request.Password.Length < 6)
            {
                return BadRequest("Şifre en az 6 karakter olmalıdır.");
            }

            // Aynı e-posta adresi daha önce kullanılmış mı?
            var emailExists = await _context.Users
                .AnyAsync(u => u.Email == request.Email);

            if (emailExists)
            {
                return BadRequest("Bu e-posta adresi zaten kullanılıyor.");
            }

            // Gönderilen rol gerçekten var mı?
            var role = await _context.Roles
                .FirstOrDefaultAsync(r => r.Id == request.RoleId);

            if (role == null)
            {
                return BadRequest("Geçerli bir kullanıcı rolü seçilmelidir.");
            }

            var user = new User
            {
                FullName = request.FullName,
                Email = request.Email,
                RoleId = request.RoleId,
                IsActive = true,
                CreatedAt = DateTime.Now
            };

            // Şifreyi düz metin olarak saklamıyoruz.
            var passwordHasher = new PasswordHasher<User>();

            user.PasswordHash = passwordHasher.HashPassword(
                user,
                request.Password
            );

            _context.Users.Add(user);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Kullanıcı başarıyla oluşturuldu.",
                userId = user.Id,
                fullName = user.FullName,
                email = user.Email,
                role = role.Name
            });
        }


        // Kullanıcı giriş işlemi.
        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto request)
        {
            // E-posta ve şifre boş olamaz.
            if (string.IsNullOrWhiteSpace(request.Email) ||
                string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest("E-posta ve şifre boş bırakılamaz.");
            }

            // Kullanıcıyı ve rol bilgisini getiriyoruz.
            var user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u =>
                    u.Email == request.Email &&
                    u.IsActive);

            if (user == null)
            {
                return Unauthorized("E-posta veya şifre hatalı.");
            }

            // Girilen şifre ile veritabanındaki hashlenmiş şifreyi karşılaştırıyoruz.
            var passwordHasher = new PasswordHasher<User>();

            var passwordResult = passwordHasher.VerifyHashedPassword(
                user,
                user.PasswordHash,
                request.Password
            );

            if (passwordResult == PasswordVerificationResult.Failed)
            {
                return Unauthorized("E-posta veya şifre hatalı.");
            }

            // JWT içerisine kullanıcı bilgilerini ekliyoruz.
            var claims = new List<Claim>
            {
                new Claim(
                    ClaimTypes.NameIdentifier,
                    user.Id.ToString()
                ),

                new Claim(
                    ClaimTypes.Name,
                    user.FullName
                ),

                new Claim(
                    ClaimTypes.Email,
                    user.Email
                ),

                new Claim(
                    ClaimTypes.Role,
                    user.Role?.Name ?? ""
                )
            };

            // appsettings.json içerisindeki JWT anahtarını alıyoruz.
            var jwtKey = _configuration["Jwt:Key"];

            if (string.IsNullOrWhiteSpace(jwtKey))
            {
                return StatusCode(
                    500,
                    "JWT anahtarı yapılandırılmamış."
                );
            }

            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtKey)
            );

            var credentials = new SigningCredentials(
                key,
                SecurityAlgorithms.HmacSha256
            );

            var expireMinutes = int.Parse(
                _configuration["Jwt:ExpireMinutes"] ?? "120"
            );

            // JWT token oluşturuluyor.
            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(expireMinutes),
                signingCredentials: credentials
            );

            var tokenString =
                new JwtSecurityTokenHandler()
                    .WriteToken(token);

            return Ok(new
            {
                message = "Giriş başarılı.",
                userId = user.Id,
                fullName = user.FullName,
                email = user.Email,
                role = user.Role?.Name,
                token = tokenString
            });
        }
    }
}