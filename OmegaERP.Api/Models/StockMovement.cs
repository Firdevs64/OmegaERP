namespace OmegaERP.Api.Models
{
    public class StockMovement
    {
        public int Id { get; set; }

        // Hangi ürünün stok hareketi olduğunu tutar.
        public int ProductId { get; set; }

        // ManualEntry, ManualExit, Purchase, Sale gibi işlem türlerini tutar.
        public string MovementType { get; set; } = string.Empty;

        // Giren veya çıkan ürün miktarı.
        public int Quantity { get; set; }

        // İşlemle ilgili açıklama.
        public string? Description { get; set; }

        // İşlemin yapıldığı tarih.
        public DateTime TransactionDate { get; set; }

        // Ürün bilgisine ulaşmak için kullanılır.
        public Product? Product { get; set; }
    }
}