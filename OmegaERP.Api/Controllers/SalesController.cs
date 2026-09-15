using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OmegaERP.Api.Data;
using OmegaERP.Api.DTOs;
using OmegaERP.Api.Models;

namespace OmegaERP.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SalesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SalesController(AppDbContext context)
        {
            _context = context;
        }


        // Tüm satış kayıtlarını listeler.
        [HttpGet]
        public async Task<IActionResult> GetSales()
        {
            var sales = await _context.Sales
                .OrderByDescending(s => s.SaleDate)
                .Select(s => new
                {
                    s.Id,
                    s.InvoiceNumber,
                    s.SaleDate,
                    s.TotalAmount,
                    s.Status,

                    Customer = new
                    {
                        s.CustomerId,
                        CustomerName = s.Customer != null
                            ? s.Customer.Name
                            : ""
                    },

                    Items = s.SaleItems.Select(i => new
                    {
                        i.Id,
                        i.ProductId,

                        ProductName = i.Product != null
                            ? i.Product.Name
                            : "",

                        i.Quantity,
                        i.UnitPrice,
                        i.TotalPrice
                    })
                })
                .ToListAsync();

            return Ok(sales);
        }


        // ID değerine göre tek satışın detaylarını getirir.
        [HttpGet("{id}")]
        public async Task<IActionResult> GetSaleById(int id)
        {
            var sale = await _context.Sales
                .Where(s => s.Id == id)
                .Select(s => new
                {
                    s.Id,
                    s.InvoiceNumber,
                    s.SaleDate,
                    s.TotalAmount,
                    s.Status,
                    s.CreatedAt,

                    Customer = new
                    {
                        s.CustomerId,
                        CustomerName = s.Customer != null
                            ? s.Customer.Name
                            : ""
                    },

                    Items = s.SaleItems.Select(i => new
                    {
                        i.Id,
                        i.ProductId,

                        ProductName = i.Product != null
                            ? i.Product.Name
                            : "",

                        i.Quantity,
                        i.UnitPrice,
                        i.TotalPrice
                    })
                })
                .FirstOrDefaultAsync();

            if (sale == null)
            {
                return NotFound("Satış kaydı bulunamadı.");
            }

            return Ok(sale);
        }


        // Yeni satış işlemi oluşturur.
        [HttpPost]
        public async Task<IActionResult> CreateSale(SaleCreateDto request)
        {
            // Müşterinin sistemde ve aktif olup olmadığını kontrol ediyoruz.
            var customer = await _context.Customers
                .FirstOrDefaultAsync(c =>
                    c.Id == request.CustomerId &&
                    c.IsActive);

            if (customer == null)
            {
                return BadRequest(
                    "Geçerli ve aktif bir müşteri seçilmelidir."
                );
            }


            // Satışta en az bir ürün bulunmalıdır.
            if (request.Items == null || request.Items.Count == 0)
            {
                return BadRequest(
                    "Satış işleminde en az bir ürün bulunmalıdır."
                );
            }


            // İşlem sırasında hata oluşursa yarım kayıt kalmaması
            // için transaction kullanıyoruz.
            using var transaction =
                await _context.Database.BeginTransactionAsync();

            try
            {
                var sale = new Sale
                {
                    CustomerId = request.CustomerId,

                    // Otomatik satış/fatura numarası oluşturuyoruz.
                    InvoiceNumber =
                        $"SAT-{DateTime.UtcNow:yyyyMMddHHmmssfff}",

                    SaleDate = DateTime.UtcNow,

                    TotalAmount = 0,

                    Status = "Completed",

                    CreatedAt = DateTime.UtcNow
                };


                decimal totalAmount = 0;


                foreach (var item in request.Items)
                {
                    // Satış miktarı kontrolü.
                    if (item.Quantity <= 0)
                    {
                        await transaction.RollbackAsync();

                        return BadRequest(
                            "Ürün miktarı 0'dan büyük olmalıdır."
                        );
                    }


                    // Satış fiyatı kontrolü.
                    if (item.UnitPrice <= 0)
                    {
                        await transaction.RollbackAsync();

                        return BadRequest(
                            "Ürün satış fiyatı 0'dan büyük olmalıdır."
                        );
                    }


                    // Ürün sistemde var mı?
                    var product = await _context.Products
                        .FirstOrDefaultAsync(p =>
                            p.Id == item.ProductId &&
                            p.IsActive);

                    if (product == null)
                    {
                        await transaction.RollbackAsync();

                        return BadRequest(
                            $"ID değeri {item.ProductId} olan ürün bulunamadı."
                        );
                    }


                    // Yeterli stok var mı?
                    if (product.StockQuantity < item.Quantity)
                    {
                        await transaction.RollbackAsync();

                        return BadRequest(
                            $"{product.Name} ürünü için yeterli stok bulunmamaktadır. " +
                            $"Mevcut stok: {product.StockQuantity}"
                        );
                    }


                    // Satır toplamı.
                    decimal itemTotal =
                        item.Quantity * item.UnitPrice;

                    totalAmount += itemTotal;


                    // Satış kalemini oluşturuyoruz.
                    var saleItem = new SaleItem
                    {
                        ProductId = product.Id,

                        Quantity = item.Quantity,

                        UnitPrice = item.UnitPrice,

                        TotalPrice = itemTotal
                    };

                    sale.SaleItems.Add(saleItem);


                    // Satış yapıldığı için stok azalır.
                    product.StockQuantity -= item.Quantity;


                    // Stok hareket geçmişine satış kaydı ekliyoruz.
                    var stockMovement = new StockMovement
                    {
                        ProductId = product.Id,

                        MovementType = "Sale",

                        Quantity = item.Quantity,

                        Description =
                            $"Satış - {sale.InvoiceNumber}",

                        TransactionDate = DateTime.UtcNow
                    };

                    _context.StockMovements.Add(stockMovement);
                }


                sale.TotalAmount = totalAmount;

                // Satış toplamını müşterinin cari bakiyesine ekliyoruz.
                // Bu tutar bizim müşteriden alacağımızı gösterir.
                customer.CurrentBalance += totalAmount;

                // Satış için cari hareket kaydı oluşturuyoruz.
                var currentTransaction = new CurrentAccountTransaction
                {
                    CustomerId = customer.Id,
                    SupplierId = null,
                    TransactionType = "Sale",
                    Amount = totalAmount,
                    Description = $"Satış - {sale.InvoiceNumber}",
                    TransactionDate = DateTime.UtcNow
                };

                _context.CurrentAccountTransactions.Add(currentTransaction);

                _context.Sales.Add(sale);

                await _context.SaveChangesAsync();

                await transaction.CommitAsync();


                return CreatedAtAction(
                    nameof(GetSaleById),
                    new { id = sale.Id },
                    new
                    {
                        message = "Satış işlemi başarıyla oluşturuldu.",

                        saleId = sale.Id,

                        invoiceNumber = sale.InvoiceNumber,

                        customerName = customer.Name,

                        totalAmount = sale.TotalAmount
                    }
                );
            }
            catch
            {
                await transaction.RollbackAsync();

                return StatusCode(
                    500,
                    "Satış işlemi sırasında bir hata oluştu."
                );
            }
        }
    }
}