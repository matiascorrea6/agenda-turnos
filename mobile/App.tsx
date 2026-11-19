import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AgendaScreen } from './src/screens/AgendaScreen';
import { ReservarScreen } from './src/screens/ReservarScreen';
import { colores } from './src/estilos';
import { sumarDias } from './src/fechas';

// La app tiene dos pantallas. En vez de una librería de navegación, un estado decide cuál se muestra:
// alcanza para dos pantallas y es más fácil de seguir.
export default function App() {
  const [pantalla, setPantalla] = useState<'agenda' | 'reservar'>('agenda');
  const [fecha, setFecha] = useState(() => sumarDias(new Date(), 1)); // arranca en mañana, como el front web

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: colores.fondo }}>
        <StatusBar style="dark" />
        {pantalla === 'agenda' ? (
          <AgendaScreen fecha={fecha} onCambiarFecha={setFecha} onReservar={() => setPantalla('reservar')} />
        ) : (
          <ReservarScreen fecha={fecha} onVolver={() => setPantalla('agenda')} />
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
