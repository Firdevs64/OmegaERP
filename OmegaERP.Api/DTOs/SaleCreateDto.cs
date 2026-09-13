namespace OmegaERP.Api.DTOs
{
    public class SaleCreateDto
    {
        public int CustomerId { get; set; }

        public List<SaleItemCreateDto> Items { get; set; }
            = new List<SaleItemCreateDto>();
    }
}