import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { api, ErrorApi, Servicio } from '../api';
import { e } from '../estilos';
import { aIso, fechaLarga, hora } from '../fechas';

interface Props {
  fecha: Date;
  onVolver: () => void;
}

// Pantalla 2: elegir servicio, horario libre y datos de la persona.
export function ReservarScreen({ fecha, onVolver }: Props) {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [servicioId, setServicioId] = useState<number | null>(null);
  const [libres, setLibres] = useState<string[]>([]);
  const [horario, setHorario] = useState<string | null>(null);
  const [cliente, setCliente] = useState('');
  const [telefono, setTelefono] = useState('');
  const [cargandoLibres, setCargandoLibres] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  // Al abrir la pantalla se traen los servicios.
  useEffect(() => {
    api.servicios().then(setServicios).catch((err) => setError(err.message));
  }, []);

  // Cada vez que se elige otro servicio se piden sus horarios libres.
  useEffect(() => {
    if (servicioId === null) return;
    setHorario(null);
    setCargandoLibres(true);
    api
      .horariosLibres(aIso(fecha), servicioId)
      .then(setLibres)
      .catch((err) => setError(err.message))
      .finally(() => setCargandoLibres(false));
  }, [servicioId, fecha]);

  const completo = servicioId !== null && horario !== null && cliente.trim() !== '' && telefono.trim() !== '';

  async function reservar() {
    if (!completo) return;
    setEnviando(true);
    setError('');
    try {
      await api.reservar({ servicioId: servicioId!, cliente: cliente.trim(), telefono: telefono.trim(), inicio: horario! });
      Alert.alert('Turno reservado', `${cliente.trim()}, ${fechaLarga(fecha)} a las ${hora(horario!)}.`);
      onVolver();
    } catch (err) {
      // 409: alguien reservó ese horario mientras tanto. 400: datos no válidos.
      setError(err instanceof ErrorApi ? err.message : 'Algo salió mal.');
      if (err instanceof ErrorApi && err.status === 409) {
        setLibres((l) => l.filter((h) => h !== horario));
        setHorario(null);
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <ScrollView style={e.pantalla} contentContainerStyle={e.contenido} keyboardShouldPersistTaps="handled">
      <Pressable onPress={onVolver} hitSlop={12}>
        <Text style={{ color: '#3f6cdf', fontSize: 16 }}>‹ Volver</Text>
      </Pressable>
      <Text style={e.titulo}>Nuevo turno</Text>
      <Text style={e.textoGris}>{fechaLarga(fecha)}</Text>

      <Text style={e.subtitulo}>Servicio</Text>
      <View style={e.fila}>
        {servicios.map((s) => (
          <Pressable key={s.id} style={[e.chip, s.id === servicioId && e.chipElegido]} onPress={() => setServicioId(s.id)}>
            <Text style={s.id === servicioId ? e.chipTextoElegido : e.chipTexto}>
              {s.nombre} · {s.duracionMinutos} min
            </Text>
          </Pressable>
        ))}
      </View>

      {servicioId !== null && (
        <>
          <Text style={e.subtitulo}>Horario</Text>
          {cargandoLibres ? (
            <ActivityIndicator />
          ) : libres.length === 0 ? (
            <Text style={e.textoGris}>No quedan horarios libres para este servicio ese día.</Text>
          ) : (
            <View style={e.fila}>
              {libres.map((h) => (
                <Pressable key={h} style={[e.chip, h === horario && e.chipElegido]} onPress={() => setHorario(h)}>
                  <Text style={h === horario ? e.chipTextoElegido : e.chipTexto}>{hora(h)}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </>
      )}

      <Text style={e.subtitulo}>Datos</Text>
      <TextInput style={e.input} placeholder="Nombre y apellido" value={cliente} onChangeText={setCliente} />
      <TextInput style={e.input} placeholder="Teléfono" value={telefono} onChangeText={setTelefono} keyboardType="phone-pad" />

      {error !== '' && <Text style={e.error}>{error}</Text>}

      <Pressable style={[e.boton, (!completo || enviando) && e.botonDeshabilitado]} onPress={reservar} disabled={!completo || enviando}>
        <Text style={e.botonTexto}>{enviando ? 'Reservando…' : 'Reservar'}</Text>
      </Pressable>
    </ScrollView>
  );
}
