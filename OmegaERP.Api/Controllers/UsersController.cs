using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OmegaERP.Api.Data;

namespace OmegaERP.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]

    // Bu controller içerisindeki işlemleri
    // sadece Admin rolündeki kullanıcılar kullanabilir.
    [Authorize(Roles = "Admin")]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UsersController(AppDbContext context)
        {
            _context = context;
        }

        // Sistemdeki bütün kullanıcıları listeler.
        // PasswordHash özellikle response içine dahil edilmez.
        [HttpGet]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _context.Users
                .Include(u => u.Role)
                .OrderBy(u => u.Id)
                .Select(u => new
                {
                    u.Id,
                    u.FullName,
                    u.Email,

                    Role = u.Role != null
                        ? u.Role.Name
                        : null,

                    u.IsActive,
                    u.CreatedAt
                })
                .ToListAsync();

            return Ok(users);
        }

        // ID değerine göre tek bir kullanıcı getirir.
        [HttpGet("{id}")]
        public async Task<IActionResult> GetUser(int id)
        {
            var user = await _context.Users
                .Include(u => u.Role)
                .Where(u => u.Id == id)
                .Select(u => new
                {
                    u.Id,
                    u.FullName,
                    u.Email,
                    u.RoleId,

                    Role = u.Role != null
                        ? u.Role.Name
                        : null,

                    u.IsActive,
                    u.CreatedAt
                })
                .FirstOrDefaultAsync();

            if (user == null)
            {
                return NotFound("Kullanıcı bulunamadı.");
            }

            return Ok(user);
        }

        // Kullanıcının rolünü değiştirir.
        // Örneğin Employee -> Admin veya Admin -> Employee.
        [HttpPut("{id}/role")]
        public async Task<IActionResult> ChangeRole(
            int id,
            [FromBody] ChangeUserRoleRequest request)
        {
            var user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null)
            {
                return NotFound("Kullanıcı bulunamadı.");
            }

            var role = await _context.Roles
                .FirstOrDefaultAsync(r => r.Id == request.RoleId);

            if (role == null)
            {
                return BadRequest("Geçerli bir rol bulunamadı.");
            }

            user.RoleId = role.Id;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Kullanıcının rolü başarıyla güncellendi.",
                userId = user.Id,
                user.FullName,
                roleId = role.Id,
                role = role.Name
            });
        }

        // Kullanıcının aktif/pasif durumunu değiştirir.
        // true -> aktif
        // false -> pasif
        [HttpPut("{id}/status")]
        public async Task<IActionResult> ChangeStatus(
            int id,
            [FromBody] ChangeUserStatusRequest request)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null)
            {
                return NotFound("Kullanıcı bulunamadı.");
            }

            user.IsActive = request.IsActive;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = request.IsActive
                    ? "Kullanıcı aktif hale getirildi."
                    : "Kullanıcı pasif hale getirildi.",

                userId = user.Id,
                user.FullName,
                user.Email,
                user.IsActive
            });
        }
    }

    // Rol değiştirmek için Swagger'dan gönderilecek veri.
    public class ChangeUserRoleRequest
    {
        public int RoleId { get; set; }
    }

    // Kullanıcı durumunu değiştirmek için gönderilecek veri.
    public class ChangeUserStatusRequest
    {
        public bool IsActive { get; set; }
    }
}