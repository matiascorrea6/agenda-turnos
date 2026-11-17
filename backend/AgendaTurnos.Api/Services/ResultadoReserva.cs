using AgendaTurnos.Api.Models;

namespace AgendaTurnos.Api.Services;

public record ResultadoReserva(Turno? Turno, string? Error, bool EsConflicto)
{
    public bool Ok => Turno is not null;

    public static ResultadoReserva Exito(Turno turno) => new(turno, null, false);
    public static ResultadoReserva Invalido(string error) => new(null, error, false);
    public static ResultadoReserva Conflicto(string error) => new(null, error, true);
}
