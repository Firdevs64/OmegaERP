using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using OmegaERP.Api.Models;

namespace OmegaERP.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public DbSet<Role> Roles { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<StockMovement> StockMovements { get; set; }
        public DbSet<Customer> Customers { get; set; }
        public DbSet<Supplier> Suppliers { get; set; }
        public DbSet<Purchase> Purchases { get; set; }
        public DbSet<PurchaseItem> PurchaseItems { get; set; }
        public DbSet<Sale> Sales { get; set; }
        public DbSet<SaleItem> SaleItems { get; set; }
        public DbSet<CurrentAccountTransaction> CurrentAccountTransactions { get; set; }
        public DbSet<User> Users { get; set; }

        protected override void ConfigureConventions(
            ModelConfigurationBuilder configurationBuilder)
        {
            // PostgreSQL "timestamp with time zone" yalnızca UTC DateTime kabul eder.
            // Projedeki bütün DateTime alanlarını veritabanına yazmadan önce
            // UTC olarak normalize ediyoruz.
            configurationBuilder
                .Properties<DateTime>()
                .HaveConversion<UtcDateTimeConverter>();

            configurationBuilder
                .Properties<DateTime?>()
                .HaveConversion<NullableUtcDateTimeConverter>();
        }

        private sealed class UtcDateTimeConverter
            : ValueConverter<DateTime, DateTime>
        {
            public UtcDateTimeConverter()
                : base(
                    value => value.Kind == DateTimeKind.Utc
                        ? value
                        : value.Kind == DateTimeKind.Local
                            ? value.ToUniversalTime()
                            : DateTime.SpecifyKind(value, DateTimeKind.Utc),

                    value => DateTime.SpecifyKind(
                        value,
                        DateTimeKind.Utc))
            {
            }
        }

        private sealed class NullableUtcDateTimeConverter
            : ValueConverter<DateTime?, DateTime?>
        {
            public NullableUtcDateTimeConverter()
                : base(
                    value => !value.HasValue
                        ? value
                        : value.Value.Kind == DateTimeKind.Utc
                            ? value
                            : value.Value.Kind == DateTimeKind.Local
                                ? value.Value.ToUniversalTime()
                                : DateTime.SpecifyKind(
                                    value.Value,
                                    DateTimeKind.Utc),

                    value => !value.HasValue
                        ? value
                        : DateTime.SpecifyKind(
                            value.Value,
                            DateTimeKind.Utc))
            {
            }
        }
    }
}