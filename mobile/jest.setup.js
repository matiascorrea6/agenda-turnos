// En las pruebas no hay pantalla real: se usan medidas fijas para el área segura.
jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);
