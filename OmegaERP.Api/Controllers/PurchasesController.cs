using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OmegaERP.Api.Data;
using OmegaERP.Api.DTOs;
using OmegaERP.Api.Models;

namespace OmegaERP.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PurchasesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PurchasesController(AppDbContext context)
        {
            _context = context;
        }


        // Tüm satın alma kayıtlarını listeler.
        [HttpGet]
        public async Task<IActionResult> GetPurchases()
        {
            var purchases = await _context.Purchases
                .OrderByDescending(p => p.PurchaseDate)
                .Select(p => new
                {
                    p.Id,
                    p.InvoiceNumber,
                    p.PurchaseDate,
                    p.TotalAmount,
                    p.Status,

                    Supplier = new
                    {
                        p.SupplierId,
                        SupplierName = p.Supplier != null
                            ? p.Supplier.Name
                            : ""
                    },

                    Items = p.PurchaseItems.Select(i => new
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

            return Ok(purchases);
        }


        // Id değerine göre satın alma detayını getirir.
        [HttpGet("{id}")]
        public async Task<IActionResult> GetPurchaseById(int id)
        {
            var purchase = await _context.Purchases
                .Where(p => p.Id == id)
                .Select(p => new
                {
                    p.Id,
                    p.InvoiceNumber,
                    p.PurchaseDate,
                    p.TotalAmount,
                    p.Status,
                    p.CreatedAt,

                    Supplier = new
                    {
                        p.SupplierId,
                        SupplierName = p.Supplier != null
                            ? p.Supplier.Name
                            : ""
                    },

                    Items = p.PurchaseItems.Select(i => new
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

            if (purchase == null)
            {
                return NotFound("Satın alma kaydı bulunamadı.");
            }

            return Ok(purchase);
        }


        // Yeni satın alma işlemi oluşturur.
        [HttpPost]
        public async Task<IActionResult> CreatePurchase(
            PurchaseCreateDto request)
        {
            // Tedarikçi kontrolü.
            var supplier = await _context.Suppliers
                .FirstOrDefaultAsync(s =>
                    s.Id == request.SupplierId &&
                    s.IsActive);

            if (supplier == null)
            {
                return BadRequest(
                    "Geçerli ve aktif bir tedarikçi seçilmelidir."
                );
            }

            // En az bir ürün olmalı.
            if (request.Items == null || request.Items.Count == 0)
            {
                return BadRequest(
                    "Satın alma işleminde en az bir ürün bulunmalıdır."
                );
            }


            // İşlemlerden biri hata verirse hiçbir kayıt yarım kalmasın.
            using var transaction =
                await _context.Database.BeginTransactionAsync();

            try
            {
                var purchase = new Purchase
                {
                    SupplierId = request.SupplierId,

                    // Otomatik satın alma numarası oluşturuyoruz.
                    InvoiceNumber =
                        $"ALI-{DateTime.UtcNow:yyyyMMddHHmmssfff}",

                    PurchaseDate = DateTime.UtcNow,

                    TotalAmount = 0,

                    Status = "Completed",

                    CreatedAt = DateTime.UtcNow
                };


                decimal totalAmount = 0;


                foreach (var item in request.Items)
                {
                    if (item.Quantity <= 0)
                    {
                        return BadRequest(
                            "Ürün miktarı 0'dan büyük olmalıdır."
                        );
                    }

                    if (item.UnitPrice <= 0)
                    {
                        return BadRequest(
                            "Ürün alış fiyatı 0'dan büyük olmalıdır."
                        );
                    }


                    // Ürün sistemde var mı?
                    var product = await _context.Products
                        .FirstOrDefaultAsync(p =>
                            p.Id == item.ProductId &&
                            p.IsActive);

                    if (product == null)
                    {
                        return BadRequest(
                            $"ID değeri {item.ProductId} olan ürün bulunamadı."
                        );
                    }


                    // Satır toplamını hesaplıyoruz.
                    var itemTotal =
                        item.Quantity * item.UnitPrice;

                    totalAmount += itemTotal;


                    // Satın alma kalemini oluşturuyoruz.
                    var purchaseItem = new PurchaseItem
                    {
                        ProductId = item.ProductId,

                        Quantity = item.Quantity,

                        UnitPrice = item.UnitPrice,

                        TotalPrice = itemTotal
                    };

                    purchase.PurchaseItems.Add(purchaseItem);


                    // Satın alma olduğu için ürün stoğu artar.
                    product.StockQuantity += item.Quantity;


                    // Stok hareket geçmişine de kayıt düşüyoruz.
                    var stockMovement = new StockMovement
                    {
                        ProductId = product.Id,

                        MovementType = "Purchase",

                        Quantity = item.Quantity,

                        Description =
                            $"Satın alma - {purchase.InvoiceNumber}",

                        TransactionDate = DateTime.UtcNow
                    };

                    _context.StockMovements.Add(stockMovement);
                }


                purchase.TotalAmount = totalAmount;
                // Satın alma toplamını tedarikçinin cari bakiyesine ekliyoruz.
                // Bu tutar bizim tedarikçiye olan borcumuzu gösterir.
                supplier.CurrentBalance += totalAmount;

                // Satın alma için cari hareket oluşturuyoruz.
                var currentTransaction = new CurrentAccountTransaction
                {
                    CustomerId = null,
                    SupplierId = supplier.Id,
                    TransactionType = "Purchase",
                    Amount = totalAmount,
                    Description = $"Satın alma - {purchase.InvoiceNumber}",
                    TransactionDate = DateTime.UtcNow
                };

                _context.CurrentAccountTransactions.Add(currentTransaction);

                _context.Purchases.Add(purchase);

                await _context.SaveChangesAsync();

                await transaction.CommitAsync();


                return CreatedAtAction(
                    nameof(GetPurchaseById),
                    new { id = purchase.Id },
                    new
                    {
                        message = "Satın alma işlemi başarıyla oluşturuldu.",

                        purchaseId = purchase.Id,

                        invoiceNumber = purchase.InvoiceNumber,

                        supplierName = supplier.Name,

                        totalAmount = purchase.TotalAmount
                    }
                );
            }
            catch
            {
                await transaction.RollbackAsync();

                return StatusCode(
                    500,
                    "Satın alma işlemi sırasında bir hata oluştu."
                );
            }
        }
    }
}