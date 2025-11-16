using Microsoft.EntityFrameworkCore;
using Portal.Core.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Infrastructure.Persistence
{
    internal class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
        public DbSet<User> Users => Set<User>();
        public DbSet<Property> Properties => Set<Property>();
        public DbSet<PropertyPhoto> PropertyPhotos => Set<PropertyPhoto>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure Property entity
            modelBuilder.Entity<Property>(entity =>
            {
                entity.HasKey(p => p.Id);
                entity.Property(p => p.Title).IsRequired().HasMaxLength(200);
                entity.Property(p => p.Description).HasMaxLength(5000);
                entity.Property(p => p.Price).HasPrecision(18, 2);
                entity.Property(p => p.Area).HasPrecision(18, 2);
                entity.Property(p => p.Type).HasConversion<int>();
                entity.Property(p => p.Category).HasConversion<int>();
                entity.Property(p => p.ContactNumber).HasMaxLength(50);
                
                // Relationship with User
                entity.HasOne(p => p.User)
                    .WithMany()
                    .HasForeignKey(p => p.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
                
                // Relationship with Photos
                entity.HasMany(p => p.Photos)
                    .WithOne(ph => ph.Property)
                    .HasForeignKey(ph => ph.PropertyId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Configure PropertyPhoto entity
            modelBuilder.Entity<PropertyPhoto>(entity =>
            {
                entity.HasKey(p => p.Id);
                entity.Property(p => p.FileName).IsRequired().HasMaxLength(255);
                entity.Property(p => p.FilePath).HasMaxLength(1000); // Optional if storing in DB
                entity.Property(p => p.ImageData).HasColumnType("varbinary(max)"); // Store image data
                entity.Property(p => p.ContentType).HasMaxLength(100);
                
                // Relationship with Property
                entity.HasOne(p => p.Property)
                    .WithMany(pr => pr.Photos)
                    .HasForeignKey(p => p.PropertyId)
                    .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}
