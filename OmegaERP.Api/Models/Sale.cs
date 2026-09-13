namespace OmegaERP.Api.Models
{
    public class Sale
    {
        public int Id { get; set; }

        // Satışın hangi müşteriye yapıldığını tutar.
        public int CustomerId { get; set; }

        // Satış için oluşturulan fatura numarası.
        public string InvoiceNumber { get; set; } = string.Empty;

        public DateTime SaleDate { get; set; }

        // Satışın toplam tutarı.
        public decimal TotalAmount { get; set; }

        // Completed, Cancelled vb.
        public string Status { get; set; } = "Completed";

        public DateTime CreatedAt { get; set; }

        // Müşteri ilişkisi.
        public Customer? Customer { get; set; }

        // Bir satış içerisinde birden fazla ürün bulunabilir.
        public ICollection<SaleItem> SaleItems { get; set; }
            = new List<SaleItem>();
    }
}