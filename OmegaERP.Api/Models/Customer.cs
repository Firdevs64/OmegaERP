namespace OmegaERP.Api.Models
{
    public class Customer
    {
        public int Id { get; set; }

        // Müşteriyi sistem içerisinde ayırt etmek için kullanılan kod.
        public string CustomerCode { get; set; } = string.Empty;

        // Müşteri veya firma adı.
        public string Name { get; set; } = string.Empty;

        public string? Phone { get; set; }

        public string? Email { get; set; }

        // Vergi numarası bilgisi.
        public string? TaxNumber { get; set; }

        public string? Address { get; set; }

        // Müşterinin mevcut cari bakiyesi.
        public decimal CurrentBalance { get; set; }

        // Müşterinin aktif olup olmadığını belirtir.
        public bool IsActive { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}