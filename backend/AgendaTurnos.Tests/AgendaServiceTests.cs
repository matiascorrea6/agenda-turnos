using AgendaTurnos.Api.Data;
using AgendaTurnos.Api.Dtos;
using AgendaTurnos.Api.Services;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace AgendaTurnos.Tests;

public class AgendaServiceTests
{
    // Lunes 4 de marzo de 2030. "Ahora" es el lunes anterior, así nada cae en el pasado.
    private static readonly DateTime Lunes = new(2030, 3, 4);
    private const int Consulta = 1;        // 30 minutos
    private const int LimpiezaFacial = 2;  // 60 minutos

    private static AgendaService CrearAgenda(DateTime? ahora = null)
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        var db = new AppDbContext(options);
        db.Database.EnsureCreated(); // carga los servicios de ejemplo
        return new AgendaService(db, new RelojFijo(ahora ?? Lunes.AddDays(-7)));
    }

    private static CrearTurnoRequest Pedido(int servicioId, DateTime inicio) =>
        new(servicioId, "Lucía", "1155550000", inicio);

    [Fact]
    public async Task Reserva_un_turno_y_calcula_el_fin_con_la_duracion_del_servicio()
    {
        var agenda = CrearAgenda();

        var r = await agenda.ReservarAsync(Pedido(LimpiezaFacial, Lunes.AddHours(10)));

        Assert.True(r.Ok);
        Assert.Equal(Lunes.AddHours(11), r.Turno!.Fin);
    }

    [Fact]
    public async Task No_permite_dos_turnos_que_se_pisan()
    {
        var agenda = CrearAgenda();
        await agenda.ReservarAsync(Pedido(LimpiezaFacial, Lunes.AddHours(10)));

        var r = await agenda.ReservarAsync(Pedido(Consulta, Lunes.AddHours(10.5)));

        Assert.False(r.Ok);
        Assert.True(r.EsConflicto);
    }

    [Fact]
    public async Task Permite_un_turno_que_empieza_justo_cuando_termina_otro()
    {
        var agenda = CrearAgenda();
        await agenda.ReservarAsync(Pedido(LimpiezaFacial, Lunes.AddHours(10)));

        var r = await agenda.ReservarAsync(Pedido(Consulta, Lunes.AddHours(11)));

        Assert.True(r.Ok);
    }

    [Theory]
    [InlineData(8.5)]   // antes de abrir
    [InlineData(18.5)]  // la limpieza de 60 minutos terminaría 19:30
    public async Task Rechaza_turnos_fuera_del_horario(double hora)
    {
        var agenda = CrearAgenda();

        var r = await agenda.ReservarAsync(Pedido(LimpiezaFacial, Lunes.AddHours(hora)));

        Assert.False(r.Ok);
        Assert.False(r.EsConflicto);
    }

    [Fact]
    public async Task Rechaza_los_domingos_y_el_pasado()
    {
        var agenda = CrearAgenda(ahora: Lunes.AddHours(12));

        var domingo = await agenda.ReservarAsync(Pedido(Consulta, Lunes.AddDays(6).AddHours(10)));
        var pasado = await agenda.ReservarAsync(Pedido(Consulta, Lunes.AddHours(10)));

        Assert.False(domingo.Ok);
        Assert.False(pasado.Ok);
    }

    [Fact]
    public async Task Los_horarios_libres_no_incluyen_los_ocupados()
    {
        var agenda = CrearAgenda();
        await agenda.ReservarAsync(Pedido(LimpiezaFacial, Lunes.AddHours(10)));

        var libres = await agenda.HorariosLibresAsync(DateOnly.FromDateTime(Lunes), Consulta);

        Assert.Contains(Lunes.AddHours(9.5), libres);
        Assert.DoesNotContain(Lunes.AddHours(10), libres);
        Assert.DoesNotContain(Lunes.AddHours(10.5), libres);
        Assert.Contains(Lunes.AddHours(11), libres);
        Assert.Equal(Lunes.AddHours(18.5), libres[^1]);
    }

    private class RelojFijo(DateTime ahora) : TimeProvider
    {
        public override DateTimeOffset GetUtcNow() => new(ahora, TimeSpan.Zero);
        public override TimeZoneInfo LocalTimeZone => TimeZoneInfo.Utc;
    }
}
