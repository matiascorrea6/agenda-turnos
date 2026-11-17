import { Component, OnInit, inject } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AgendaService, Servicio, Turno } from './agenda.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, DatePipe, CurrencyPipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  private agenda = inject(AgendaService);

  fecha = new Date(Date.now() + 86400000).toISOString().slice(0, 10); // mañana
  servicios: Servicio[] = [];
  turnos: Turno[] = [];
  libres: string[] = [];

  servicioId = 0;
  horario = '';
  cliente = '';
  telefono = '';
  mensaje = '';
  error = '';

  ngOnInit(): void {
    this.agenda.servicios().subscribe((s) => {
      this.servicios = s;
      this.servicioId = s[0]?.id ?? 0;
      this.cargarDia();
    });
  }

  cargarDia(): void {
    this.agenda.turnosDelDia(this.fecha).subscribe((t) => (this.turnos = t));
    this.cargarLibres();
  }

  cargarLibres(): void {
    this.horario = '';
    if (!this.servicioId) return;
    this.agenda.horariosLibres(this.fecha, this.servicioId).subscribe((h) => (this.libres = h));
  }

  reservar(): void {
    this.mensaje = '';
    this.error = '';
    this.agenda
      .reservar({ servicioId: this.servicioId, cliente: this.cliente, telefono: this.telefono, inicio: this.horario })
      .subscribe({
        next: (t) => {
          this.mensaje = `Turno reservado para ${t.cliente}.`;
          this.cliente = '';
          this.telefono = '';
          this.cargarDia();
        },
        error: (e: HttpErrorResponse) => (this.error = e.error?.error ?? 'No se pudo reservar el turno.'),
      });
  }

  cancelar(turno: Turno): void {
    if (!confirm(`¿Cancelar el turno de ${turno.cliente}?`)) return;
    this.agenda.cancelar(turno.id).subscribe(() => this.cargarDia());
  }
}
