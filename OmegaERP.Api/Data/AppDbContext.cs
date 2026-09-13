using Microsoft.EntityFrameworkCore;
using OmegaERP.Api.Models;

namespace OmegaERP.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        // Kullanıcı rolleri.
        public DbSet<Role> Roles { get; set; }

        // Ürün kategorileri.
        public DbSet<Category> Categories { get; set; }

        // Sistemde kayıtlı ürünler.
        public DbSet<Product> Products { get; set; }

        public DbSet<StockMovement> StockMovements { get; set; }

        // Müşteriler
        public DbSet<Customer> Customers { get; set; }

        // Tedarikçiler
        public DbSet<Supplier> Suppliers { get; set; }

        public DbSet<Purchase> Purchases { get; set; }

        public DbSet<PurchaseItem> PurchaseItems { get; set; }

        public DbSet<Sale> Sales { get; set; }
        public DbSet<SaleItem> SaleItems { get; set; }

        public DbSet<CurrentAccountTransaction> CurrentAccountTransactions { get; set; }

        public DbSet<User> Users { get; set; }
    }
}