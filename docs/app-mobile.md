# La app mobile, explicada

Guía para entender `mobile/` sin haber usado React Native antes. Se lee en 15 minutos.

## Qué es

Una app para el celular que usa la misma API de .NET que el front de Angular. No tiene base de datos propia: todo lo pide a la API.

- **React Native**: se escribe en TypeScript con componentes, como React para la web, pero en vez de `<div>` y `<p>` se usan `<View>` y `<Text>`, que el celular dibuja como pantallas nativas.
- **Expo**: herramientas encima de React Native para no tener que configurar Android Studio ni Xcode. Con `npx expo start` aparece un QR, lo escaneás con la app Expo Go y la app corre en tu celular.

## Qué hace cada archivo

| Archivo | Qué hace |
| --- | --- |
| `App.tsx` | Punto de entrada. Guarda en un estado qué pantalla se ve (agenda o reservar) y qué día está elegido. |
| `src/api.ts` | Las llamadas a la API (`fetch`). Si algo falla, devuelve un error con el mensaje que mandó la API. |
| `src/fechas.ts` | Funciones chicas para fechas: pasar a `AAAA-MM-DD`, sumar días, «viernes 20 de noviembre», sacar la hora. |
| `src/screens/AgendaScreen.tsx` | Pantalla 1: lista de turnos del día, flechas para cambiar de día, deslizar para recargar, mantener apretado para cancelar. |
| `src/screens/ReservarScreen.tsx` | Pantalla 2: elegir servicio, horario libre, nombre y teléfono, y reservar. |
| `src/estilos.ts` | Colores y estilos compartidos (`StyleSheet`, parecido a CSS). |
| `src/__tests__/` | Pruebas con Jest. |

## Cómo funciona una reserva, paso a paso

1. En la agenda tocás «Reservar turno». `App.tsx` cambia el estado `pantalla` a `'reservar'` y React dibuja la otra pantalla.
2. Al abrirse, `ReservarScreen` pide los servicios a la API (`GET /api/servicios`) dentro de un `useEffect`.
3. Elegís un servicio. Eso cambia el estado `servicioId`, y otro `useEffect` que «mira» ese valor pide los horarios libres (`GET /api/turnos/libres`).
4. Elegís horario y completás nombre y teléfono. El botón «Reservar» queda deshabilitado hasta que está todo.
5. Al reservar se manda `POST /api/turnos`. Si la API responde 409 (alguien tomó ese horario recién), se muestra su mensaje y ese horario se saca de la lista. Si sale bien, aparece un aviso y se vuelve a la agenda.

## Los conceptos que te pueden preguntar

- **Componente**: una función que devuelve lo que se ve en pantalla. `AgendaScreen` y `ReservarScreen` son componentes.
- **Props**: los datos que un componente le pasa a otro. `App` le pasa a `AgendaScreen` la fecha y qué hacer al tocar «Reservar» (`onReservar`).
- **Estado (`useState`)**: datos que cambian y, cuando cambian, React vuelve a dibujar la pantalla. Ejemplos: la lista de turnos, el horario elegido, si está cargando.
- **`useEffect`**: código que corre después de dibujar, cuando cambia algo que le indicás. Se usa para pedir datos a la API.
- **`async` / `await`**: esperar la respuesta de la API sin trabar la app.
- **`FlatList`**: lista optimizada para el celular: solo dibuja lo que está en pantalla.
- **Por qué no `localhost`**: en el celular, `localhost` es el propio celular. La app tiene que apuntar a la IP de la compu donde corre la API (archivo `.env`).

## Las pruebas

- `fechas.test.ts`: que las fechas salgan bien (por ejemplo, que el 30 de noviembre más un día dé el 1 de diciembre).
- `api.test.ts`: con un `fetch` falso, que un 409 llegue con el mensaje de la API, que el DELETE sin cuerpo no falle y que sin conexión el mensaje sea claro.
- `App.test.tsx`: una reserva completa con la API simulada: abre la agenda, elige servicio y horario, completa los datos y comprueba qué se manda en el POST.

Se corren con `npm test` y también en GitHub Actions en cada push.

## Preguntas de entrevista y cómo contestarlas

**«¿Qué hiciste en React Native?»**
Una app chica que consume mi API de .NET: agenda del día, reserva con horarios libres y cancelación, con TypeScript y pruebas. Mi fuerte es el back con .NET y SQL Server; en React Native tengo una base que puedo ampliar rápido.

**«¿Por qué no usaste una librería de navegación?»**
Con dos pantallas, un estado alcanza y queda más simple. Si la app creciera, usaría Expo Router o React Navigation.

**«¿Cómo manejás los errores de la API?»**
Todo pasa por una función (`pedir` en `api.ts`). Si la respuesta no es 2xx, lee el `{ error }` que manda la API y lo muestra. Si no hay conexión, da un mensaje propio.

**«¿Qué pasa si dos personas reservan el mismo horario?»**
La regla vive en el back (`AgendaService`), no en la app. La API responde 409 al segundo, y la app muestra el mensaje y saca ese horario de la lista.

**«¿Cómo la probarías en un celular real?»**
Levanto la API con Docker, pongo la IP de la compu en `.env`, corro `npx expo start` y escaneo el QR con Expo Go.

**«¿Qué le agregarías?»**
Login para el consultorio, selector de fecha con calendario, avisos con notificaciones push y publicarla con EAS Build.

Si te preguntan algo que no sabés, decilo y contá cómo lo resolverías. En un perfil junior pesa más eso que inventar.
