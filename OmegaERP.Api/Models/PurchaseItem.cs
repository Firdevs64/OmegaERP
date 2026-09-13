namespace OmegaERP.Api.Models
{
    public class PurchaseItem
    {
        public int Id { get; set; }

        public int PurchaseId { get; set; }

        public int ProductId { get; set; }

        public int Quantity { get; set; }

        public decimal UnitPrice { get; set; }

        // Quantity * UnitPrice
        public decimal TotalPrice { get; set; }

        public Purchase? Purchase { get; set; }

        public Product? Product { get; set; }
    }
}