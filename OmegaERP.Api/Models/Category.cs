using System.Text.Json.Serialization;
namespace OmegaERP.Api.Models
{
    public class Category
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }

        public DateTime CreatedAt { get; set; }

        // Veritabanı ilişkisi için kullanılıyor.
        // JSON çıktısına dahil edilmez, aksi halde Product-Category
        // arasında sonsuz döngü oluşabilir.
        [JsonIgnore]
        public ICollection<Product> Products { get; set; }
            = new List<Product>();
    }
}