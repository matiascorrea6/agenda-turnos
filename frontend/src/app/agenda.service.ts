import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface Servicio {
  id: number;
  nombre: string;
  duracionMinutos: number;
  precio: number;
}

export interface Turno {
  id: number;
  servicio: string;
  cliente: string;
  telefono: string;
  inicio: string;
  fin: string;
}

export interface NuevoTurno {
  servicioId: number;
  cliente: string;
  telefono: string;
  inicio: string;
}

@Injectable({ providedIn: 'root' })
export class AgendaService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;

  servicios(): Observable<Servicio[]> {
    return this.http.get<Servicio[]>(`${this.api}/servicios`);
  }

  turnosDelDia(fecha: string): Observable<Turno[]> {
    return this.http.get<Turno[]>(`${this.api}/turnos`, { params: { fecha } });
  }

  horariosLibres(fecha: string, servicioId: number): Observable<string[]> {
    return this.http.get<string[]>(`${this.api}/turnos/libres`, { params: { fecha, servicioId } });
  }

  reservar(turno: NuevoTurno): Observable<Turno> {
    return this.http.post<Turno>(`${this.api}/turnos`, turno);
  }

  cancelar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/turnos/${id}`);
  }
}
