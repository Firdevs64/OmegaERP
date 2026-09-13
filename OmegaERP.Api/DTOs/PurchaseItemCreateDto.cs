namespace OmegaERP.Api.DTOs
{
    public class PurchaseItemCreateDto
    {
        public int ProductId { get; set; }

        public int Quantity { get; set; }

        public decimal UnitPrice { get; set; }
    }
}