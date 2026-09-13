namespace OmegaERP.Api.Models
{
    public class CurrentAccountTransaction
    {
        public int Id { get; set; }

        // Hareket müşteriye aitse dolar.
        public int? CustomerId { get; set; }

        // Hareket tedarikçiye aitse dolar.
        public int? SupplierId { get; set; }

        // Sale, Purchase, CustomerPayment, SupplierPayment gibi.
        public string TransactionType { get; set; } = string.Empty;

        public decimal Amount { get; set; }

        public string? Description { get; set; }

        public DateTime TransactionDate { get; set; }

        public Customer? Customer { get; set; }

        public Supplier? Supplier { get; set; }
    }
}