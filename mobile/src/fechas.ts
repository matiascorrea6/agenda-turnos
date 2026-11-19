// Funciones chicas para manejar fechas. No dependen de React, por eso se prueban fácil.

/** Fecha local en formato AAAA-MM-DD, que es lo que espera la API en ?fecha= */
export function aIso(fecha: Date): string {
  const a = fecha.getFullYear();
  const m = String(fecha.getMonth() + 1).padStart(2, '0');
  const d = String(fecha.getDate()).padStart(2, '0');
  return `${a}-${m}-${d}`;
}

/** Suma (o resta) días a una fecha sin modificar la original. */
export function sumarDias(fecha: Date, dias: number): Date {
  const nueva = new Date(fecha);
  nueva.setDate(nueva.getDate() + dias);
  return nueva;
}

const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

/** "viernes 20 de noviembre" */
export function fechaLarga(fecha: Date): string {
  return `${DIAS[fecha.getDay()]} ${fecha.getDate()} de ${MESES[fecha.getMonth()]}`;
}

/**
 * La API devuelve fechas sin zona horaria ("2026-11-20T09:30:00").
 * Se toma la hora tal cual viene, sin convertirla, para mostrar "09:30".
 */
export function hora(fechaApi: string): string {
  return fechaApi.slice(11, 16);
}
