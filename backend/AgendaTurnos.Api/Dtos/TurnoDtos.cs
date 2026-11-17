using AgendaTurnos.Api.Models;

namespace AgendaTurnos.Api.Dtos;

public record CrearTurnoRequest(int ServicioId, string Cliente, string Telefono, DateTime Inicio);

public record TurnoResponse(int Id, string Servicio, string Cliente, string Telefono, DateTime Inicio, DateTime Fin)
{
    public static TurnoResponse Desde(Turno t) =>
        new(t.Id, t.Servicio?.Nombre ?? "", t.Cliente, t.Telefono, t.Inicio, t.Fin);
}
