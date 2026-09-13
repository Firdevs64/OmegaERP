namespace OmegaERP.Api.Models
{
    public class Product
    {
        public int Id { get; set; }

        // Ürünün sistem içerisindeki benzersiz kodu.
        // Örneğin: URN-0001
        public string Code { get; set; } = string.Empty;

        // Ürünün görünen adı.
        public string Name { get; set; } = string.Empty;

        // Ürünün bağlı olduğu kategori.
        public int CategoryId { get; set; }

        // Ürünün alış fiyatı.
        public decimal PurchasePrice { get; set; }

        // Ürünün satış fiyatı.
        public decimal SalePrice { get; set; }

        // Ürünün mevcut stok miktarı.
        public int StockQuantity { get; set; }

        // Kritik stok uyarısı için kullanılacak alt sınır.
        public int MinimumStockLevel { get; set; }

        // Adet, Kg, Kutu vb.
        public string Unit { get; set; } = "Adet";

        // Ürünün sistemde aktif olup olmadığını belirtir.
        public bool IsActive { get; set; }

        public DateTime CreatedAt { get; set; }


        // CategoryId ile Categories tablosu arasındaki ilişki.
        public Category? Category { get; set; }
    }
}