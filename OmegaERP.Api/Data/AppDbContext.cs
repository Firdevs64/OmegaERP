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

        public DbSet<CurrentAccountTransaction> CurrentAccountTransactions
        {
            get;
            set;
        }

        public DbSet<User> Users { get; set; }

        public override int SaveChanges()
        {
            NormalizeDateTimesToUtc();
            return base.SaveChanges();
        }

        public override int SaveChanges(bool acceptAllChangesOnSuccess)
        {
            NormalizeDateTimesToUtc();
            return base.SaveChanges(acceptAllChangesOnSuccess);
        }

        public override Task<int> SaveChangesAsync(
            CancellationToken cancellationToken = default)
        {
            NormalizeDateTimesToUtc();

            return base.SaveChangesAsync(cancellationToken);
        }

        public override Task<int> SaveChangesAsync(
            bool acceptAllChangesOnSuccess,
            CancellationToken cancellationToken = default)
        {
            NormalizeDateTimesToUtc();

            return base.SaveChangesAsync(
                acceptAllChangesOnSuccess,
                cancellationToken
            );
        }

        private void NormalizeDateTimesToUtc()
        {
            foreach (var entry in ChangeTracker.Entries())
            {
                foreach (var property in entry.Properties)
                {
                    if (property.Metadata.ClrType == typeof(DateTime))
                    {
                        if (property.CurrentValue is DateTime value)
                        {
                            property.CurrentValue = value.Kind switch
                            {
                                DateTimeKind.Utc => value,

                                DateTimeKind.Local =>
                                    value.ToUniversalTime(),

                                DateTimeKind.Unspecified =>
                                    DateTime.SpecifyKind(
                                        value,
                                        DateTimeKind.Utc
                                    ),

                                _ => value
                            };
                        }
                    }

                    if (property.Metadata.ClrType == typeof(DateTime?))
                    {
                        if (property.CurrentValue is DateTime value)
                        {
                            property.CurrentValue = value.Kind switch
                            {
                                DateTimeKind.Utc => value,

                                DateTimeKind.Local =>
                                    value.ToUniversalTime(),

                                DateTimeKind.Unspecified =>
                                    DateTime.SpecifyKind(
                                        value,
                                        DateTimeKind.Utc
                                    ),

                                _ => value
                            };
                        }
                    }
                }
            }
        }
    }
}