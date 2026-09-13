namespace OmegaERP.Api.DTOs
{
    public class PurchaseCreateDto
    {
        public int SupplierId { get; set; }

        public List<PurchaseItemCreateDto> Items { get; set; }
            = new List<PurchaseItemCreateDto>();
    }
}