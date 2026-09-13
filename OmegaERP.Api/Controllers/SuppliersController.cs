using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OmegaERP.Api.Data;
using OmegaERP.Api.Models;

namespace OmegaERP.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SuppliersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SuppliersController(AppDbContext context)
        {
            _context = context;
        }

        // Aktif tedarikçileri listeler.
        [HttpGet]
        public async Task<ActionResult<List<Supplier>>> GetSuppliers()
        {
            var suppliers = await _context.Suppliers
                .Where(s => s.IsActive)
                .OrderBy(s => s.Name)
                .ToListAsync();

            return Ok(suppliers);
        }

        // Id değerine göre tek bir tedarikçiyi getirir.
        [HttpGet("{id}")]
        public async Task<ActionResult<Supplier>> GetSupplierById(int id)
        {
            var supplier = await _context.Suppliers
                .FirstOrDefaultAsync(s => s.Id == id && s.IsActive);

            if (supplier == null)
            {
                return NotFound("Tedarikçi bulunamadı.");
            }

            return Ok(supplier);
        }

        // Yeni tedarikçi ekler.
        [HttpPost]
        public async Task<ActionResult<Supplier>> CreateSupplier(Supplier supplier)
        {
            if (string.IsNullOrWhiteSpace(supplier.SupplierCode))
            {
                return BadRequest("Tedarikçi kodu boş bırakılamaz.");
            }

            if (string.IsNullOrWhiteSpace(supplier.Name))
            {
                return BadRequest("Tedarikçi adı boş bırakılamaz.");
            }

            // Aynı tedarikçi kodunun tekrar kullanılmasını engelliyoruz.
            var codeExists = await _context.Suppliers
                .AnyAsync(s => s.SupplierCode == supplier.SupplierCode);

            if (codeExists)
            {
                return BadRequest("Bu tedarikçi kodu zaten kullanılıyor.");
            }

            supplier.CurrentBalance = 0;
            supplier.IsActive = true;
            supplier.CreatedAt = DateTime.Now;

            _context.Suppliers.Add(supplier);

            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetSupplierById),
                new { id = supplier.Id },
                supplier
            );
        }

        // Mevcut tedarikçinin bilgilerini günceller.
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSupplier(
            int id,
            Supplier updatedSupplier)
        {
            var supplier = await _context.Suppliers.FindAsync(id);

            if (supplier == null)
            {
                return NotFound("Güncellenecek tedarikçi bulunamadı.");
            }

            if (string.IsNullOrWhiteSpace(updatedSupplier.SupplierCode))
            {
                return BadRequest("Tedarikçi kodu boş bırakılamaz.");
            }

            if (string.IsNullOrWhiteSpace(updatedSupplier.Name))
            {
                return BadRequest("Tedarikçi adı boş bırakılamaz.");
            }

            // Aynı kod başka bir tedarikçide kullanılıyor mu?
            var codeExists = await _context.Suppliers
                .AnyAsync(s =>
                    s.SupplierCode == updatedSupplier.SupplierCode &&
                    s.Id != id);

            if (codeExists)
            {
                return BadRequest(
                    "Bu tedarikçi kodu başka bir tedarikçide kullanılıyor."
                );
            }

            supplier.SupplierCode = updatedSupplier.SupplierCode;
            supplier.Name = updatedSupplier.Name;
            supplier.Phone = updatedSupplier.Phone;
            supplier.Email = updatedSupplier.Email;
            supplier.TaxNumber = updatedSupplier.TaxNumber;
            supplier.Address = updatedSupplier.Address;
            supplier.IsActive = updatedSupplier.IsActive;

            // CurrentBalance daha sonra cari hesap işlemleriyle yönetilecek.
            // CreatedAt ise ilk oluşturulma tarihi olduğu için korunuyor.

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // Tedarikçiyi tamamen silmek yerine pasif hale getirir.
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSupplier(int id)
        {
            var supplier = await _context.Suppliers.FindAsync(id);

            if (supplier == null)
            {
                return NotFound("Silinecek tedarikçi bulunamadı.");
            }

            supplier.IsActive = false;

            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}