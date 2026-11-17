using AgendaTurnos.Api.Data;
using AgendaTurnos.Api.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("Agenda")));
builder.Services.AddSingleton(TimeProvider.System);
builder.Services.AddScoped<AgendaService>();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddCors(options => options.AddDefaultPolicy(policy =>
    policy.WithOrigins(builder.Configuration["Frontend"] ?? "http://localhost:4200")
          .AllowAnyHeader()
          .AllowAnyMethod()));

var app = builder.Build();

// Crea la base y los servicios de ejemplo la primera vez.
using (var scope = app.Services.CreateScope())
{
    scope.ServiceProvider.GetRequiredService<AppDbContext>().Database.EnsureCreated();
}

app.UseSwagger();
app.UseSwaggerUI();
app.UseCors();
app.MapControllers();
app.Run();
