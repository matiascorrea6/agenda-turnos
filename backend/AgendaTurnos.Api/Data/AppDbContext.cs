using AgendaTurnos.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace AgendaTurnos.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Servicio> Servicios => Set<Servicio>();
    public DbSet<Turno> Turnos => Set<Turno>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Servicio>(e =>
        {
            e.Property(s => s.Nombre).HasMaxLength(100).IsRequired();
            e.Property(s => s.Precio).HasPrecision(10, 2);
            e.HasData(
                new Servicio { Id = 1, Nombre = "Consulta", DuracionMinutos = 30, Precio = 20000m },
                new Servicio { Id = 2, Nombre = "Limpieza facial", DuracionMinutos = 60, Precio = 38000m },
                new Servicio { Id = 3, Nombre = "Peeling", DuracionMinutos = 45, Precio = 45000m });
        });

        modelBuilder.Entity<Turno>(e =>
        {
            e.Property(t => t.Cliente).HasMaxLength(100).IsRequired();
            e.Property(t => t.Telefono).HasMaxLength(30);
            e.HasIndex(t => t.Inicio);
        });
    }
}
