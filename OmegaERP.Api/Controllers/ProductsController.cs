using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OmegaERP.Api.Data;
using OmegaERP.Api.Models;
using Microsoft.AspNetCore.Authorization;

namespace OmegaERP.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ProductsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProductsController(AppDbContext context)
        {
            _context = context;
        }

        // Sistemde kayıtlı ve aktif olan bütün ürünleri getirir.
        // Include kullanarak ürünün kategori bilgisini de sorguya dahil ediyoruz.
        [HttpGet]
        public async Task<ActionResult<List<Product>>> GetProducts()
        {
            var products = await _context.Products
                .Where(p => p.IsActive)
                .Include(p => p.Category)
                .ToListAsync();

            return Ok(products);
        }

        // Yeni ürün ekler.
        [HttpPost]
        public async Task<ActionResult<Product>> CreateProduct(Product product)
        {
            // Ürün kodu boş gönderilemez.
            if (string.IsNullOrWhiteSpace(product.Code))
            {
                return BadRequest("Ürün kodu boş bırakılamaz.");
            }

            // Ürün adı boş gönderilemez.
            if (string.IsNullOrWhiteSpace(product.Name))
            {
                return BadRequest("Ürün adı boş bırakılamaz.");
            }

            // Ürün kodunun başındaki ve sonundaki gereksiz boşlukları temizliyoruz.
            product.Code = product.Code.Trim();

            // Ürün adının başındaki ve sonundaki gereksiz boşlukları temizliyoruz.
            product.Name = product.Name.Trim();

            // Stok miktarı negatif olamaz.
            if (product.StockQuantity < 0)
            {
                return BadRequest("Stok miktarı negatif olamaz.");
            }

            // Minimum stok seviyesi negatif olamaz.
            if (product.MinimumStockLevel < 0)
            {
                return BadRequest("Minimum stok seviyesi negatif olamaz.");
            }

            // Alış fiyatı negatif olamaz.
            if (product.PurchasePrice < 0)
            {
                return BadRequest("Alış fiyatı negatif olamaz.");
            }

            // Satış fiyatı negatif olamaz.
            if (product.SalePrice < 0)
            {
                return BadRequest("Satış fiyatı negatif olamaz.");
            }

            // Girilen kategori gerçekten var mı kontrol ediyoruz.
            var categoryExists = await _context.Categories
                .AnyAsync(c => c.Id == product.CategoryId);

            if (!categoryExists)
            {
                return BadRequest("Geçerli bir kategori seçilmelidir.");
            }

            // Aynı ürün kodu daha önce kullanılmış mı kontrol ediyoruz.
            var codeExists = await _context.Products
                .AnyAsync(p => p.Code == product.Code);

            if (codeExists)
            {
                return BadRequest("Bu ürün kodu zaten kullanılıyor.");
            }

            // Oluşturulma tarihini backend tarafında belirliyoruz.
            product.CreatedAt = DateTime.UtcNow;

            // Yeni ürün varsayılan olarak aktif olsun.
            product.IsActive = true;

            _context.Products.Add(product);

            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetProductById),
                new { id = product.Id },
                product
            );
        }

        // Id değerine göre tek bir ürünü getirir.
        [HttpGet("{id}")]
        public async Task<ActionResult<Product>> GetProductById(int id)
        {
            var product = await _context.Products
                .Include(p => p.Category)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (product == null)
            {
                return NotFound("Ürün bulunamadı.");
            }

            return Ok(product);
        }

        // Mevcut bir ürünü günceller.
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProduct(int id, Product updatedProduct)
        {
            var product = await _context.Products.FindAsync(id);

            if (product == null)
            {
                return NotFound("Güncellenecek ürün bulunamadı.");
            }

            // Ürün kodu boş gönderilemez.
            if (string.IsNullOrWhiteSpace(updatedProduct.Code))
            {
                return BadRequest("Ürün kodu boş bırakılamaz.");
            }

            // Ürün adı boş gönderilemez.
            if (string.IsNullOrWhiteSpace(updatedProduct.Name))
            {
                return BadRequest("Ürün adı boş bırakılamaz.");
            }

            updatedProduct.Code = updatedProduct.Code.Trim();
            updatedProduct.Name = updatedProduct.Name.Trim();

            // Negatif değer kontrolleri.
            if (updatedProduct.StockQuantity < 0)
            {
                return BadRequest("Stok miktarı negatif olamaz.");
            }

            if (updatedProduct.MinimumStockLevel < 0)
            {
                return BadRequest("Minimum stok seviyesi negatif olamaz.");
            }

            if (updatedProduct.PurchasePrice < 0)
            {
                return BadRequest("Alış fiyatı negatif olamaz.");
            }

            if (updatedProduct.SalePrice < 0)
            {
                return BadRequest("Satış fiyatı negatif olamaz.");
            }

            // Gönderilen kategori gerçekten var mı kontrol ediyoruz.
            var categoryExists = await _context.Categories
                .AnyAsync(c => c.Id == updatedProduct.CategoryId);

            if (!categoryExists)
            {
                return BadRequest("Geçerli bir kategori seçilmelidir.");
            }

            // Ürün kodu değiştirilmişse aynı kod başka üründe kullanılıyor mu?
            var codeExists = await _context.Products
                .AnyAsync(p => p.Code == updatedProduct.Code && p.Id != id);

            if (codeExists)
            {
                return BadRequest("Bu ürün kodu başka bir üründe kullanılıyor.");
            }

            // Güncellenmesine izin verdiğimiz alanları değiştiriyoruz.
            product.Code = updatedProduct.Code;
            product.Name = updatedProduct.Name;
            product.CategoryId = updatedProduct.CategoryId;
            product.PurchasePrice = updatedProduct.PurchasePrice;
            product.SalePrice = updatedProduct.SalePrice;
            product.StockQuantity = updatedProduct.StockQuantity;
            product.MinimumStockLevel = updatedProduct.MinimumStockLevel;
            product.Unit = updatedProduct.Unit;
            product.IsActive = updatedProduct.IsActive;

            // CreatedAt değiştirilmez.
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // Ürünü tamamen silmek yerine pasif hale getirir.
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);

            if (product == null)
            {
                return NotFound("Silinecek ürün bulunamadı.");
            }

            product.IsActive = false;

            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}