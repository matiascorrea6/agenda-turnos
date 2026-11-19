// Todo lo que habla con la API de .NET está acá. Las pantallas solo llaman a estas funciones.
// Son los mismos endpoints que usa el front de Angular (frontend/src/app/agenda.service.ts).

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

// La dirección de la API sale del archivo .env (ver .env.example).
// En el celular no sirve "localhost": hay que poner la IP de la compu donde corre la API.
const API = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:5080/api';

/** Error con el mensaje que manda la API, para mostrárselo a la persona tal cual. */
export class ErrorApi extends Error {
  constructor(mensaje: string, public status: number) {
    super(mensaje);
  }
}

async function pedir<T>(ruta: string, opciones?: RequestInit): Promise<T> {
  let respuesta: Response;
  try {
    respuesta = await fetch(`${API}${ruta}`, {
      ...opciones,
      headers: { 'Content-Type': 'application/json', ...opciones?.headers },
    });
  } catch {
    throw new ErrorApi('No se pudo conectar con la API. Revisá que esté corriendo y la dirección del archivo .env.', 0);
  }

  if (!respuesta.ok) {
    // La API responde { "error": "..." } cuando un turno no se puede reservar (400 o 409).
    const cuerpo = await respuesta.json().catch(() => null);
    throw new ErrorApi(cuerpo?.error ?? `La API respondió con error ${respuesta.status}.`, respuesta.status);
  }

  // DELETE responde 204, sin cuerpo.
  return (respuesta.status === 204 ? undefined : await respuesta.json()) as T;
}

export const api = {
  servicios: () => pedir<Servicio[]>('/servicios'),
  turnosDelDia: (fecha: string) => pedir<Turno[]>(`/turnos?fecha=${fecha}`),
  horariosLibres: (fecha: string, servicioId: number) =>
    pedir<string[]>(`/turnos/libres?fecha=${fecha}&servicioId=${servicioId}`),
  reservar: (turno: NuevoTurno) => pedir<Turno>('/turnos', { method: 'POST', body: JSON.stringify(turno) }),
  cancelar: (id: number) => pedir<void>(`/turnos/${id}`, { method: 'DELETE' }),
};
