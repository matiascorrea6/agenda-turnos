import { render, screen, userEvent, waitFor } from '@testing-library/react-native';
import App from '../../App';

// Prueba de punta a punta de la app, con una API falsa: ver la agenda vacía, reservar y volver.
const servicios = [{ id: 1, nombre: 'Limpieza facial', duracionMinutos: 45, precio: 25000 }];
const libres = ['2030-01-10T09:00:00', '2030-01-10T09:30:00'];

function responder(cuerpo: unknown, status = 200) {
  return Promise.resolve({ ok: status < 300, status, json: () => Promise.resolve(cuerpo) } as Response);
}

test('reservar un turno desde la app', async () => {
  const fetchFalso = jest.spyOn(global, 'fetch').mockImplementation((url, opciones) => {
    const u = String(url);
    if (u.includes('/servicios')) return responder(servicios);
    if (u.includes('/turnos/libres')) return responder(libres);
    if (opciones?.method === 'POST') return responder({ id: 7 }, 201);
    return responder([]); // turnos del día
  });

  const user = userEvent.setup();
  await render(<App />);
  expect(await screen.findByText('No hay turnos este día.')).toBeTruthy();

  await user.press(screen.getByText('Reservar turno'));
  await user.press(await screen.findByText('Limpieza facial · 45 min'));
  await user.press(await screen.findByText('09:30'));
  await user.type(screen.getByPlaceholderText('Nombre y apellido'), 'Ana Pérez');
  await user.type(screen.getByPlaceholderText('Teléfono'), '1155556666');
  await user.press(screen.getByText('Reservar'));

  await waitFor(() => expect(screen.getByText('Agenda')).toBeTruthy());
  const post = fetchFalso.mock.calls.find(([, o]) => o?.method === 'POST');
  expect(JSON.parse(String(post![1]!.body))).toEqual({
    servicioId: 1,
    cliente: 'Ana Pérez',
    telefono: '1155556666',
    inicio: '2030-01-10T09:30:00',
  });
});
