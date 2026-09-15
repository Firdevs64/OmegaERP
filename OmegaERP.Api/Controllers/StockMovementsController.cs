using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OmegaERP.Api.Data;
using OmegaERP.Api.Models;

namespace OmegaERP.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StockMovementsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public StockMovementsController(AppDbContext context)
        {
            _context = context;
        }

        // Tüm stok hareketlerini listeler.
        [HttpGet]
        public async Task<ActionResult<List<StockMovement>>> GetStockMovements()
        {
            var movements = await _context.StockMovements
                .Include(s => s.Product)
                .OrderByDescending(s => s.TransactionDate)
                .ToListAsync();

            return Ok(movements);
        }

        // Manuel stok girişi yapar.
        [HttpPost("entry")]
        public async Task<IActionResult> StockEntry(
            int productId,
            int quantity,
            string? description)
        {
            if (quantity <= 0)
            {
                return BadRequest("Miktar 0'dan büyük olmalıdır.");
            }

            var product = await _context.Products.FindAsync(productId);

            if (product == null)
            {
                return NotFound("Ürün bulunamadı.");
            }

            // Ürünün stok miktarını artırıyoruz.
            product.StockQuantity += quantity;

            // Stok hareketi kaydı oluşturuyoruz.
            var movement = new StockMovement
            {
                ProductId = productId,
                MovementType = "ManualEntry",
                Quantity = quantity,
                Description = description,
                TransactionDate = DateTime.UtcNow
            };

            _context.StockMovements.Add(movement);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Stok girişi başarılı.",
                productId = product.Id,
                productName = product.Name,
                newStockQuantity = product.StockQuantity
            });
        }

        // Manuel stok çıkışı yapar.
        [HttpPost("exit")]
        public async Task<IActionResult> StockExit(
            int productId,
            int quantity,
            string? description)
        {
            if (quantity <= 0)
            {
                return BadRequest("Miktar 0'dan büyük olmalıdır.");
            }

            var product = await _context.Products.FindAsync(productId);

            if (product == null)
            {
                return NotFound("Ürün bulunamadı.");
            }

            // Mevcut stoktan fazla çıkış yapılmasını engelliyoruz.
            if (product.StockQuantity < quantity)
            {
                return BadRequest("Yeterli stok bulunmamaktadır.");
            }

            // Ürünün stok miktarını azaltıyoruz.
            product.StockQuantity -= quantity;

            // Stok hareketi kaydı oluşturuyoruz.
            var movement = new StockMovement
            {
                ProductId = productId,
                MovementType = "ManualExit",
                Quantity = quantity,
                Description = description,
                TransactionDate = DateTime.UtcNow
            };

            _context.StockMovements.Add(movement);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Stok çıkışı başarılı.",
                productId = product.Id,
                productName = product.Name,
                newStockQuantity = product.StockQuantity
            });
        }

        // Belirli bir ürüne ait tüm stok hareketlerini getirir.
        [HttpGet("product/{productId}")]
        public async Task<IActionResult> GetMovementsByProduct(int productId)
        {
            var productExists = await _context.Products
                .AnyAsync(p => p.Id == productId);

            if (!productExists)
            {
                return NotFound("Ürün bulunamadı.");
            }

            var movements = await _context.StockMovements
                .Where(s => s.ProductId == productId)
                .OrderByDescending(s => s.TransactionDate)
                .ToListAsync();

            return Ok(movements);
        }

        // Stok miktarı minimum stok seviyesine eşit veya altında olan
        // aktif ürünleri getirir.
        [HttpGet("critical-stock")]
        public async Task<IActionResult> GetCriticalStockProducts()
        {
            var products = await _context.Products
                .Where(p =>
                    p.IsActive &&
                    p.StockQuantity <= p.MinimumStockLevel)
                .Include(p => p.Category)
                .ToListAsync();

            return Ok(products);
        }
    }
}