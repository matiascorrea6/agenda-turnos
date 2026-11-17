using AgendaTurnos.Api.Dtos;
using AgendaTurnos.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace AgendaTurnos.Api.Controllers;

[ApiController]
[Route("api/turnos")]
public class TurnosController(AgendaService agenda) : ControllerBase
{
    // GET api/turnos?fecha=2026-11-20
    [HttpGet]
    public async Task<IEnumerable<TurnoResponse>> DelDia([FromQuery] DateOnly fecha) =>
        (await agenda.TurnosDelDiaAsync(fecha)).Select(TurnoResponse.Desde);

    // GET api/turnos/libres?fecha=2026-11-20&servicioId=2
    [HttpGet("libres")]
    public async Task<List<DateTime>> Libres([FromQuery] DateOnly fecha, [FromQuery] int servicioId) =>
        await agenda.HorariosLibresAsync(fecha, servicioId);

    [HttpPost]
    public async Task<IActionResult> Crear(CrearTurnoRequest pedido)
    {
        var resultado = await agenda.ReservarAsync(pedido);
        if (resultado.Ok)
            return Created($"/api/turnos/{resultado.Turno!.Id}", TurnoResponse.Desde(resultado.Turno));

        var error = new { error = resultado.Error };
        return resultado.EsConflicto ? Conflict(error) : BadRequest(error);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Cancelar(int id) =>
        await agenda.CancelarAsync(id) ? NoContent() : NotFound();
}
