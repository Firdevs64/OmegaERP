using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OmegaERP.Api.Data;
using OmegaERP.Api.Models;

namespace OmegaERP.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CustomersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CustomersController(AppDbContext context)
        {
            _context = context;
        }

        // Sistemdeki aktif müşterileri listeler.
        [HttpGet]
        public async Task<ActionResult<List<Customer>>> GetCustomers()
        {
            var customers = await _context.Customers
                .Where(c => c.IsActive)
                .OrderBy(c => c.Name)
                .ToListAsync();

            return Ok(customers);
        }
        // Yeni müşteri ekler.
        [HttpPost]
        public async Task<ActionResult<Customer>> CreateCustomer(Customer customer)
        {
            // Müşteri kodu boş gönderilemez.
            if (string.IsNullOrWhiteSpace(customer.CustomerCode))
            {
                return BadRequest("Müşteri kodu boş bırakılamaz.");
            }

            // Müşteri adı boş gönderilemez.
            if (string.IsNullOrWhiteSpace(customer.Name))
            {
                return BadRequest("Müşteri adı boş bırakılamaz.");
            }

            // Aynı müşteri kodu daha önce kullanılmış mı kontrol ediyoruz.
            var codeExists = await _context.Customers
                .AnyAsync(c => c.CustomerCode == customer.CustomerCode);

            if (codeExists)
            {
                return BadRequest("Bu müşteri kodu zaten kullanılıyor.");
            }

            // Yeni müşteri varsayılan olarak aktif olsun.
            customer.IsActive = true;

            // İlk cari bakiye başlangıçta 0 olsun.
            customer.CurrentBalance = 0;

            // Oluşturulma tarihini backend tarafında belirliyoruz.
            customer.CreatedAt = DateTime.Now;

            _context.Customers.Add(customer);

            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetCustomerById),
                new { id = customer.Id },
                customer
            );
        }
        // Id değerine göre tek bir müşteriyi getirir.
        [HttpGet("{id}")]
        public async Task<ActionResult<Customer>> GetCustomerById(int id)
        {
            var customer = await _context.Customers
                .FirstOrDefaultAsync(c => c.Id == id && c.IsActive);

            if (customer == null)
            {
                return NotFound("Müşteri bulunamadı.");
            }

            return Ok(customer);
        }
        // Mevcut müşteri bilgilerini günceller.
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCustomer(int id, Customer updatedCustomer)
        {
            var customer = await _context.Customers.FindAsync(id);

            if (customer == null)
            {
                return NotFound("Güncellenecek müşteri bulunamadı.");
            }

            if (string.IsNullOrWhiteSpace(updatedCustomer.CustomerCode))
            {
                return BadRequest("Müşteri kodu boş bırakılamaz.");
            }

            if (string.IsNullOrWhiteSpace(updatedCustomer.Name))
            {
                return BadRequest("Müşteri adı boş bırakılamaz.");
            }

            // Aynı müşteri kodu başka bir müşteride kullanılıyor mu?
            var codeExists = await _context.Customers
                .AnyAsync(c =>
                    c.CustomerCode == updatedCustomer.CustomerCode &&
                    c.Id != id);

            if (codeExists)
            {
                return BadRequest("Bu müşteri kodu başka bir müşteride kullanılıyor.");
            }

            customer.CustomerCode = updatedCustomer.CustomerCode;
            customer.Name = updatedCustomer.Name;
            customer.Phone = updatedCustomer.Phone;
            customer.Email = updatedCustomer.Email;
            customer.TaxNumber = updatedCustomer.TaxNumber;
            customer.Address = updatedCustomer.Address;
            customer.IsActive = updatedCustomer.IsActive;

            // CurrentBalance ve CreatedAt burada değiştirilmez.
            // Cari bakiye ileride cari hesap işlemleriyle yönetilecek.

            await _context.SaveChangesAsync();

            return NoContent();
        }
        // Müşteriyi tamamen silmek yerine pasif hale getirir.
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCustomer(int id)
        {
            var customer = await _context.Customers.FindAsync(id);

            if (customer == null)
            {
                return NotFound("Silinecek müşteri bulunamadı.");
            }

            customer.IsActive = false;

            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}