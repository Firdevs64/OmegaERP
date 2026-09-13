namespace OmegaERP.Api.DTOs
{
    public class PaymentCreateDto
    {
        public decimal Amount { get; set; }

        public string? Description { get; set; }
    }
}