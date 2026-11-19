import { StyleSheet } from 'react-native';

export const colores = {
  fondo: '#f5f3ef',
  tarjeta: '#ffffff',
  texto: '#1f2328',
  gris: '#6b7280',
  borde: '#e4e0d8',
  acento: '#3f6cdf',
  peligro: '#c2410c',
};

// Estilos que comparten las dos pantallas.
export const e = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.fondo },
  contenido: { padding: 16, gap: 12 },
  titulo: { fontSize: 22, fontWeight: '700', color: colores.texto },
  subtitulo: { fontSize: 15, fontWeight: '600', color: colores.texto, marginTop: 8 },
  textoGris: { color: colores.gris },
  tarjeta: { backgroundColor: colores.tarjeta, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: colores.borde },
  boton: { backgroundColor: colores.acento, borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  botonTexto: { color: '#fff', fontWeight: '700', fontSize: 16 },
  botonDeshabilitado: { opacity: 0.5 },
  chip: { borderWidth: 1, borderColor: colores.borde, borderRadius: 20, paddingVertical: 8, paddingHorizontal: 14, backgroundColor: colores.tarjeta },
  chipElegido: { backgroundColor: colores.acento, borderColor: colores.acento },
  chipTexto: { color: colores.texto },
  chipTextoElegido: { color: '#fff', fontWeight: '600' },
  input: { backgroundColor: colores.tarjeta, borderWidth: 1, borderColor: colores.borde, borderRadius: 10, padding: 12, fontSize: 16 },
  error: { color: colores.peligro },
  fila: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
