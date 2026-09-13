namespace OmegaERP.Api.Models
{
    public class Supplier
    {
        public int Id { get; set; }

        // Tedarikçiyi sistem içerisinde ayırt etmek için kullanılan kod.
        public string SupplierCode { get; set; } = string.Empty;

        // Tedarikçi veya firma adı.
        public string Name { get; set; } = string.Empty;

        public string? Phone { get; set; }

        public string? Email { get; set; }

        public string? TaxNumber { get; set; }

        public string? Address { get; set; }

        // Tedarikçinin mevcut cari bakiyesi.
        public decimal CurrentBalance { get; set; }

        public bool IsActive { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}