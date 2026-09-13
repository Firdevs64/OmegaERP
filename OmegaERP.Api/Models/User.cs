namespace OmegaERP.Api.Models
{
    public class User
    {
        public int Id { get; set; }

        public string FullName { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        // Kullanıcının şifresini düz metin olarak değil,
        // hashlenmiş şekilde saklayacağız.
        public string PasswordHash { get; set; } = string.Empty;

        public int RoleId { get; set; }

        public bool IsActive { get; set; }

        public DateTime CreatedAt { get; set; }

        // Kullanıcının hangi role ait olduğunu tutar.
        public Role? Role { get; set; }
    }
}