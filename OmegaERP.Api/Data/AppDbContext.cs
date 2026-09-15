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

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            var dateTimeConverter = new ValueConverter<DateTime, DateTime>(
                value => value.Kind == DateTimeKind.Utc
                    ? value
                    : value.Kind == DateTimeKind.Local
                        ? value.ToUniversalTime()
                        : DateTime.SpecifyKind(value, DateTimeKind.Utc),

                value => DateTime.SpecifyKind(
                    value,
                    DateTimeKind.Utc
                )
            );

            var nullableDateTimeConverter =
                new ValueConverter<DateTime?, DateTime?>(
                    value => !value.HasValue
                        ? value
                        : value.Value.Kind == DateTimeKind.Utc
                            ? value
                            : value.Value.Kind == DateTimeKind.Local
                                ? value.Value.ToUniversalTime()
                                : DateTime.SpecifyKind(
                                    value.Value,
                                    DateTimeKind.Utc
                                ),

                    value => !value.HasValue
                        ? value
                        : DateTime.SpecifyKind(
                            value.Value,
                            DateTimeKind.Utc
                        )
                );

            foreach (var entityType in modelBuilder.Model.GetEntityTypes())
            {
                foreach (var property in entityType.GetProperties())
                {
                    if (property.ClrType == typeof(DateTime))
                    {
                        property.SetValueConverter(
                            dateTimeConverter
                        );
                    }
                    else if (property.ClrType == typeof(DateTime?))
                    {
                        property.SetValueConverter(
                            nullableDateTimeConverter
                        );
                    }
                }
            }
        }
    }
}