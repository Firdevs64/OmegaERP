using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OmegaERP.Api.Data;
using OmegaERP.Api.DTOs;
using OmegaERP.Api.Models;

namespace OmegaERP.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CurrentAccountsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CurrentAccountsController(AppDbContext context)
        {
            _context = context;
        }

        // Sistemdeki bütün cari hareketleri listeler.
        [HttpGet]
        public async Task<IActionResult> GetAllTransactions()
        {
            var transactions = await _context.CurrentAccountTransactions
                .OrderByDescending(x => x.TransactionDate)
                .Select(x => new
                {
                    x.Id,
                    x.CustomerId,
                    CustomerName = x.Customer != null
                        ? x.Customer.Name
                        : null,

                    x.SupplierId,
                    SupplierName = x.Supplier != null
                        ? x.Supplier.Name
                        : null,

                    x.TransactionType,
                    x.Amount,
                    x.Description,
                    x.TransactionDate
                })
                .ToListAsync();

            return Ok(transactions);
        }

        // Belirli bir müşterinin cari hareketlerini getirir.
        [HttpGet("customer/{customerId}")]
        public async Task<IActionResult> GetCustomerTransactions(int customerId)
        {
            var customer = await _context.Customers
                .FirstOrDefaultAsync(c => c.Id == customerId);

            if (customer == null)
            {
                return NotFound("Müşteri bulunamadı.");
            }

            var transactions = await _context.CurrentAccountTransactions
                .Where(x => x.CustomerId == customerId)
                .OrderByDescending(x => x.TransactionDate)
                .ToListAsync();

            return Ok(new
            {
                customer.Id,
                customer.Name,
                customer.CurrentBalance,
                Transactions = transactions
            });
        }

        // Belirli bir tedarikçinin cari hareketlerini getirir.
        [HttpGet("supplier/{supplierId}")]
        public async Task<IActionResult> GetSupplierTransactions(int supplierId)
        {
            var supplier = await _context.Suppliers
                .FirstOrDefaultAsync(s => s.Id == supplierId);

            if (supplier == null)
            {
                return NotFound("Tedarikçi bulunamadı.");
            }

            var transactions = await _context.CurrentAccountTransactions
                .Where(x => x.SupplierId == supplierId)
                .OrderByDescending(x => x.TransactionDate)
                .ToListAsync();

            return Ok(new
            {
                supplier.Id,
                supplier.Name,
                supplier.CurrentBalance,
                Transactions = transactions
            });
        }

        // Müşteriden ödeme alındığında kullanılır.
        [HttpPost("customer/{customerId}/payment")]
        public async Task<IActionResult> CustomerPayment(
            int customerId,
            PaymentCreateDto request)
        {
            if (request.Amount <= 0)
            {
                return BadRequest("Ödeme miktarı 0'dan büyük olmalıdır.");
            }

            var customer = await _context.Customers
                .FirstOrDefaultAsync(c =>
                    c.Id == customerId &&
                    c.IsActive);

            if (customer == null)
            {
                return NotFound("Aktif müşteri bulunamadı.");
            }

            if (request.Amount > customer.CurrentBalance)
            {
                return BadRequest(
                    $"Ödeme mevcut bakiyeden fazla olamaz. Mevcut bakiye: {customer.CurrentBalance}"
                );
            }

            customer.CurrentBalance -= request.Amount;

            var transaction = new CurrentAccountTransaction
            {
                CustomerId = customer.Id,
                SupplierId = null,
                TransactionType = "CustomerPayment",
                Amount = request.Amount,
                Description = request.Description ?? "Müşteri ödemesi",
                TransactionDate = DateTime.UtcNow
            };

            _context.CurrentAccountTransactions.Add(transaction);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Müşteri ödemesi başarıyla kaydedildi.",
                customerName = customer.Name,
                paymentAmount = request.Amount,
                remainingBalance = customer.CurrentBalance
            });
        }

        // Tedarikçiye ödeme yapıldığında kullanılır.
        [HttpPost("supplier/{supplierId}/payment")]
        public async Task<IActionResult> SupplierPayment(
            int supplierId,
            PaymentCreateDto request)
        {
            if (request.Amount <= 0)
            {
                return BadRequest("Ödeme miktarı 0'dan büyük olmalıdır.");
            }

            var supplier = await _context.Suppliers
                .FirstOrDefaultAsync(s =>
                    s.Id == supplierId &&
                    s.IsActive);

            if (supplier == null)
            {
                return NotFound("Aktif tedarikçi bulunamadı.");
            }

            if (request.Amount > supplier.CurrentBalance)
            {
                return BadRequest(
                    $"Ödeme mevcut bakiyeden fazla olamaz. Mevcut bakiye: {supplier.CurrentBalance}"
                );
            }

            supplier.CurrentBalance -= request.Amount;

            var transaction = new CurrentAccountTransaction
            {
                CustomerId = null,
                SupplierId = supplier.Id,
                TransactionType = "SupplierPayment",
                Amount = request.Amount,
                Description = request.Description ?? "Tedarikçi ödemesi",
                TransactionDate = DateTime.UtcNow
            };

            _context.CurrentAccountTransactions.Add(transaction);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Tedarikçi ödemesi başarıyla kaydedildi.",
                supplierName = supplier.Name,
                paymentAmount = request.Amount,
                remainingBalance = supplier.CurrentBalance
            });
        }
    }
}