using AgendaTurnos.Api.Data;
using AgendaTurnos.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AgendaTurnos.Api.Controllers;

[ApiController]
[Route("api/servicios")]
public class ServiciosController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<List<Servicio>> Listar() =>
        await db.Servicios.OrderBy(s => s.Nombre).ToListAsync();
}
