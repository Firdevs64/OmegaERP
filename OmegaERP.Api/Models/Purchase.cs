namespace OmegaERP.Api.Models
{
    public class Purchase
    {
        public int Id { get; set; }

        // Satın almanın hangi tedarikçiden yapıldığını tutar.
        public int SupplierId { get; set; }

        // Satın alma / fatura numarası.
        public string InvoiceNumber { get; set; } = string.Empty;

        public DateTime PurchaseDate { get; set; }

        // Satın almanın genel toplam tutarı.
        public decimal TotalAmount { get; set; }

        // Completed, Cancelled vb.
        public string Status { get; set; } = "Completed";

        public DateTime CreatedAt { get; set; }

        // Tedarikçi ilişkisi.
        public Supplier? Supplier { get; set; }

        // Bir satın almada birden fazla ürün olabilir.
        public ICollection<PurchaseItem> PurchaseItems { get; set; }
            = new List<PurchaseItem>();
    }
}