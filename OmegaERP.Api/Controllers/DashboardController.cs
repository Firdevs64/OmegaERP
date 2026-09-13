using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OmegaERP.Api.Data;

namespace OmegaERP.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DashboardController(AppDbContext context)
        {
            _context = context;
        }

        // Dashboard ana ekranında kullanılacak özet bilgileri getirir.
        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary()
        {
            // Aktif ürün sayısı
            var totalProducts = await _context.Products
                .CountAsync(p => p.IsActive);

            // Kritik stok seviyesindeki aktif ürün sayısı
            var criticalStockCount = await _context.Products
                .CountAsync(p =>
                    p.IsActive &&
                    p.StockQuantity <= p.MinimumStockLevel);

            // Aktif müşteri sayısı
            var totalCustomers = await _context.Customers
                .CountAsync(c => c.IsActive);

            // Aktif tedarikçi sayısı
            var totalSuppliers = await _context.Suppliers
                .CountAsync(s => s.IsActive);

            // Toplam satış tutarı
            var totalSalesAmount = await _context.Sales
                .SumAsync(s => (decimal?)s.TotalAmount) ?? 0;

            // Toplam satın alma tutarı
            var totalPurchasesAmount = await _context.Purchases
                .SumAsync(p => (decimal?)p.TotalAmount) ?? 0;

            // Son 5 satış
            var recentSales = await _context.Sales
                .Include(s => s.Customer)
                .OrderByDescending(s => s.Id)
                .Take(5)
                .Select(s => new
                {
                    s.Id,
                    s.InvoiceNumber,

                    CustomerName = s.Customer != null
                        ? s.Customer.Name
                        : null,

                    s.TotalAmount,
                    s.SaleDate
                })
                .ToListAsync();

            // Son 5 satın alma
            var recentPurchases = await _context.Purchases
                .Include(p => p.Supplier)
                .OrderByDescending(p => p.Id)
                .Take(5)
                .Select(p => new
                {
                    p.Id,
                    p.InvoiceNumber,

                    SupplierName = p.Supplier != null
                        ? p.Supplier.Name
                        : null,

                    p.TotalAmount,
                    p.PurchaseDate
                })
                .ToListAsync();

            // Kritik stoktaki ürünleri getiriyoruz.
            var criticalStockProducts = await _context.Products
                .Where(p =>
                    p.IsActive &&
                    p.StockQuantity <= p.MinimumStockLevel)
                .OrderBy(p => p.StockQuantity)
                .Select(p => new
                {
                    p.Id,
                    p.Code,
                    p.Name,
                    p.StockQuantity,
                    p.MinimumStockLevel,
                    p.Unit
                })
                .ToListAsync();

            return Ok(new
            {
                totalProducts,
                criticalStockCount,
                totalCustomers,
                totalSuppliers,
                totalSalesAmount,
                totalPurchasesAmount,

                recentSales,
                recentPurchases,
                criticalStockProducts
            });
        }
    }
}