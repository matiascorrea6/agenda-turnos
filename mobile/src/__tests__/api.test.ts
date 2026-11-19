import { api, ErrorApi } from '../api';

// Se reemplaza fetch por uno falso para probar cómo se manejan las respuestas sin levantar la API.
function respuesta(status: number, cuerpo?: unknown) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => (cuerpo === undefined ? Promise.reject(new Error('sin cuerpo')) : Promise.resolve(cuerpo)),
  } as Response);
}

describe('api', () => {
  afterEach(() => jest.restoreAllMocks());

  test('turnosDelDia pide la fecha en la URL y devuelve la lista', async () => {
    const turnos = [{ id: 1, servicio: 'Limpieza facial', cliente: 'Ana', telefono: '11', inicio: '2026-11-20T09:00:00', fin: '2026-11-20T09:45:00' }];
    const fetchFalso = jest.spyOn(global, 'fetch').mockReturnValue(respuesta(200, turnos));

    await expect(api.turnosDelDia('2026-11-20')).resolves.toEqual(turnos);
    expect(fetchFalso.mock.calls[0][0]).toContain('/turnos?fecha=2026-11-20');
  });

  test('un 409 de la API llega como ErrorApi con el mensaje de la API', async () => {
    jest.spyOn(global, 'fetch').mockReturnValue(respuesta(409, { error: 'Ese horario ya está ocupado.' }));

    const error = await api
      .reservar({ servicioId: 1, cliente: 'Ana', telefono: '11', inicio: '2026-11-20T09:00:00' })
      .catch((e) => e);
    expect(error).toBeInstanceOf(ErrorApi);
    expect(error.status).toBe(409);
    expect(error.message).toBe('Ese horario ya está ocupado.');
  });

  test('cancelar acepta un 204 sin cuerpo', async () => {
    jest.spyOn(global, 'fetch').mockReturnValue(respuesta(204));
    await expect(api.cancelar(3)).resolves.toBeUndefined();
  });

  test('sin conexión da un mensaje claro', async () => {
    jest.spyOn(global, 'fetch').mockRejectedValue(new TypeError('Network request failed'));
    await expect(api.servicios()).rejects.toThrow('No se pudo conectar con la API');
  });
});
