# AppCables 📱

Una aplicación móvil desarrollada con React Native y Expo Router.

## 🚀 Características

- ✅ React Native 0.79.3
- ✅ Expo SDK 53
- ✅ Expo Router para navegación
- ✅ TypeScript configurado
- ✅ ESLint para calidad de código
- ✅ Configuración para Android e iOS

## 📋 Prerrequisitos

- Node.js 18 o superior
- npm o yarn
- Expo CLI
- Android Studio (para desarrollo Android)
- Xcode (para desarrollo iOS, solo macOS)

## 🛠️ Instalación

1. Clona el repositorio e instala las dependencias:   ```bash
   npm install
   ```

2. Configura tus variables de entorno:

   ```bash
   cp .env.example .env
   ```

## 🚀 Desarrollo

### Iniciar el servidor de desarrollo:

```bash
npm start
```

### Ejecutar en Android:

```bash
npm run android
```

### Ejecutar en iOS:

```bash
npm run ios
```

### Ejecutar en Web:

```bash
npm run web
```

## 🔧 Scripts disponibles

- `npm start` - Inicia Expo en modo desarrollo
- `npm run start:dev` - Inicia con dev client
- `npm run start:tunnel` - Inicia con túnel para pruebas remotas
- `npm run android` - Ejecuta en Android
- `npm run android:dev` - Ejecuta en Android en modo debug
- `npm run ios` - Ejecuta en iOS
- `npm run web` - Ejecuta en navegador web
- `npm run lint` - Ejecuta ESLint
- `npm run lint:fix` - Corrige automáticamente errores de ESLint
- `npm run type-check` - Verifica tipos de TypeScript
- `npm run prebuild` - Pre-construye el proyecto
- `npm run prebuild:clean` - Pre-construye limpiando caché

## 📱 Estructura del proyecto

```
app/                 # Rutas de la aplicación (Expo Router)
├── (tabs)/         # Rutas con tabs
├── _layout.tsx     # Layout principal
└── +not-found.tsx  # Página 404

components/         # Componentes reutilizables
├── ui/            # Componentes de UI
└── ...

constants/         # Constantes y configuraciones
hooks/            # Custom hooks
assets/           # Imágenes, fuentes, etc.
```

## 🔨 Compilación para producción

### Android:

```bash
npm run prebuild
npx expo build:android
```

### iOS:

```bash
npm run prebuild
npx expo build:ios
```

## 📝 Licencia

Este proyecto está bajo la licencia MIT.
