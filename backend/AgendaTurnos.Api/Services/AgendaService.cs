using AgendaTurnos.Api.Data;
using AgendaTurnos.Api.Dtos;
using AgendaTurnos.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace AgendaTurnos.Api.Services;

// Reglas de la agenda: horario de atención, turnos sin superponerse y nada en el pasado.
public class AgendaService(AppDbContext db, TimeProvider reloj)
{
    public static readonly TimeSpan Apertura = new(9, 0, 0);
    public static readonly TimeSpan Cierre = new(19, 0, 0);
    public const int IntervaloMinutos = 30;

    private DateTime Ahora => reloj.GetLocalNow().DateTime;

    public async Task<List<Turno>> TurnosDelDiaAsync(DateOnly fecha)
    {
        var desde = fecha.ToDateTime(TimeOnly.MinValue);
        var hasta = desde.AddDays(1);
        return await db.Turnos
            .Include(t => t.Servicio)
            .Where(t => t.Inicio >= desde && t.Inicio < hasta)
            .OrderBy(t => t.Inicio)
            .ToListAsync();
    }

    public async Task<List<DateTime>> HorariosLibresAsync(DateOnly fecha, int servicioId)
    {
        var servicio = await db.Servicios.FindAsync(servicioId);
        if (servicio is null || fecha.DayOfWeek == DayOfWeek.Sunday) return [];

        var ocupados = await TurnosDelDiaAsync(fecha);
        var duracion = TimeSpan.FromMinutes(servicio.DuracionMinutos);
        var cierre = fecha.ToDateTime(TimeOnly.FromTimeSpan(Cierre));
        var libres = new List<DateTime>();

        for (var inicio = fecha.ToDateTime(TimeOnly.FromTimeSpan(Apertura)); inicio + duracion <= cierre; inicio = inicio.AddMinutes(IntervaloMinutos))
        {
            var fin = inicio + duracion;
            if (inicio <= Ahora) continue;
            if (ocupados.Any(t => inicio < t.Fin && fin > t.Inicio)) continue;
            libres.Add(inicio);
        }
        return libres;
    }

    public async Task<ResultadoReserva> ReservarAsync(CrearTurnoRequest pedido)
    {
        if (string.IsNullOrWhiteSpace(pedido.Cliente))
            return ResultadoReserva.Invalido("Falta el nombre del cliente.");

        var servicio = await db.Servicios.FindAsync(pedido.ServicioId);
        if (servicio is null)
            return ResultadoReserva.Invalido("El servicio no existe.");

        var inicio = pedido.Inicio;
        var fin = inicio.AddMinutes(servicio.DuracionMinutos);

        if (inicio <= Ahora)
            return ResultadoReserva.Invalido("No se puede reservar un turno en el pasado.");

        var fueraDeHorario = inicio.DayOfWeek == DayOfWeek.Sunday
            || inicio.TimeOfDay < Apertura
            || fin.TimeOfDay > Cierre
            || fin.Date != inicio.Date;
        if (fueraDeHorario)
            return ResultadoReserva.Invalido("Fuera del horario de atención: lunes a sábado, de 9 a 19.");

        // Dos turnos se pisan si uno empieza antes de que termine el otro.
        var ocupado = await db.Turnos.AnyAsync(t => inicio < t.Fin && fin > t.Inicio);
        if (ocupado)
            return ResultadoReserva.Conflicto("Ese horario ya está ocupado.");

        var turno = new Turno
        {
            ServicioId = servicio.Id,
            Servicio = servicio,
            Cliente = pedido.Cliente.Trim(),
            Telefono = pedido.Telefono?.Trim() ?? "",
            Inicio = inicio,
            Fin = fin
        };
        db.Turnos.Add(turno);
        await db.SaveChangesAsync();
        return ResultadoReserva.Exito(turno);
    }

    public async Task<bool> CancelarAsync(int id)
    {
        var turno = await db.Turnos.FindAsync(id);
        if (turno is null) return false;
        db.Turnos.Remove(turno);
        await db.SaveChangesAsync();
        return true;
    }
}
