import { aIso, fechaLarga, hora, sumarDias } from '../fechas';

describe('fechas', () => {
  test('aIso arma AAAA-MM-DD con ceros adelante', () => {
    expect(aIso(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  test('sumarDias cruza de mes y no cambia la fecha original', () => {
    const original = new Date(2026, 10, 30);
    expect(aIso(sumarDias(original, 1))).toBe('2026-12-01');
    expect(aIso(original)).toBe('2026-11-30');
  });

  test('fechaLarga en castellano', () => {
    expect(fechaLarga(new Date(2026, 10, 20))).toBe('viernes 20 de noviembre');
  });

  test('hora toma la hora tal cual viene de la API', () => {
    expect(hora('2026-11-20T09:30:00')).toBe('09:30');
  });
});
