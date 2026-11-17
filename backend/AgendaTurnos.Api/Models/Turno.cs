namespace AgendaTurnos.Api.Models;

public class Turno
{
    public int Id { get; set; }
    public int ServicioId { get; set; }
    public Servicio? Servicio { get; set; }
    public string Cliente { get; set; } = "";
    public string Telefono { get; set; } = "";
    public DateTime Inicio { get; set; }
    public DateTime Fin { get; set; }
}
