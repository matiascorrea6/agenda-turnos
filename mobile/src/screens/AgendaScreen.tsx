import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { api, ErrorApi, Turno } from '../api';
import { colores, e } from '../estilos';
import { aIso, fechaLarga, hora, sumarDias } from '../fechas';

interface Props {
  fecha: Date;
  onCambiarFecha: (fecha: Date) => void;
  onReservar: () => void;
}

// Pantalla 1: los turnos de un día, con flechas para pasar de día.
export function AgendaScreen({ fecha, onCambiarFecha, onReservar }: Props) {
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const cargar = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      setTurnos(await api.turnosDelDia(aIso(fecha)));
    } catch (err) {
      setError(err instanceof ErrorApi ? err.message : 'Algo salió mal.');
    } finally {
      setCargando(false);
    }
  }, [fecha]);

  // Cada vez que cambia la fecha, se vuelven a pedir los turnos.
  useEffect(() => {
    cargar();
  }, [cargar]);

  function confirmarCancelacion(turno: Turno) {
    Alert.alert('Cancelar turno', `¿Cancelar el turno de ${turno.cliente} a las ${hora(turno.inicio)}?`, [
      { text: 'No', style: 'cancel' },
      {
        text: 'Sí, cancelar',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.cancelar(turno.id);
            cargar();
          } catch (err) {
            Alert.alert('No se pudo cancelar', err instanceof ErrorApi ? err.message : 'Algo salió mal.');
          }
        },
      },
    ]);
  }

  return (
    <View style={e.pantalla}>
      <View style={[e.contenido, { paddingBottom: 0 }]}>
        <Text style={e.titulo}>Agenda</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Pressable onPress={() => onCambiarFecha(sumarDias(fecha, -1))} hitSlop={12} accessibilityLabel="Día anterior">
            <Text style={{ fontSize: 24, color: colores.acento }}>‹</Text>
          </Pressable>
          <Text style={e.subtitulo}>{fechaLarga(fecha)}</Text>
          <Pressable onPress={() => onCambiarFecha(sumarDias(fecha, 1))} hitSlop={12} accessibilityLabel="Día siguiente">
            <Text style={{ fontSize: 24, color: colores.acento }}>›</Text>
          </Pressable>
        </View>
      </View>

      {cargando && turnos.length === 0 ? (
        <ActivityIndicator style={{ marginTop: 32 }} />
      ) : (
        <FlatList
          data={turnos}
          keyExtractor={(t) => String(t.id)}
          contentContainerStyle={e.contenido}
          refreshControl={<RefreshControl refreshing={cargando} onRefresh={cargar} />}
          ListEmptyComponent={
            <Text style={[e.textoGris, { textAlign: 'center', marginTop: 24 }]}>
              {error || 'No hay turnos este día.'}
            </Text>
          }
          renderItem={({ item }) => (
            <Pressable style={e.tarjeta} onLongPress={() => confirmarCancelacion(item)}>
              <Text style={{ fontSize: 17, fontWeight: '700', color: colores.texto }}>
                {hora(item.inicio)} a {hora(item.fin)}
              </Text>
              <Text style={{ color: colores.texto, marginTop: 2 }}>{item.servicio}</Text>
              <Text style={e.textoGris}>
                {item.cliente} · {item.telefono}
              </Text>
            </Pressable>
          )}
          ListFooterComponent={
            turnos.length > 0 ? (
              <Text style={[e.textoGris, { textAlign: 'center' }]}>Mantené apretado un turno para cancelarlo.</Text>
            ) : undefined
          }
        />
      )}

      <View style={{ padding: 16 }}>
        <Pressable style={e.boton} onPress={onReservar}>
          <Text style={e.botonTexto}>Reservar turno</Text>
        </Pressable>
      </View>
    </View>
  );
}
