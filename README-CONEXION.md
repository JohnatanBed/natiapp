# Conexión de Backend y Frontend - NatiApp

Esta guía explica cómo conectar y ejecutar correctamente el backend y frontend de NatiApp.

## Requisitos previos

- Node.js y NPM instalados
- MongoDB instalado o acceso a MongoDB Atlas
- Android Studio o Xcode (para ejecutar la aplicación)

## Estructura de la aplicación

La aplicación está dividida en dos partes principales:

1. **Backend**: API REST construida con Node.js, Express y MongoDB
2. **Frontend**: Aplicación móvil con React Native

## Configuración del Backend

El backend ya está configurado para aceptar conexiones desde el frontend. La configuración se encuentra en:

- `backend/.env`: Variables de entorno (conexión a MongoDB, puerto, etc.)
- `backend/src/config/db.js`: Configuración de la base de datos
- `backend/src/index.js`: Servidor Express con rutas API

## Configuración del Frontend

El frontend está configurado para comunicarse con el backend a través del servicio API:

- `frontend/services/ApiService.ts`: Configuración de la conexión al backend
- `frontend/services/UserManagementService.ts`: Servicio para gestión de usuarios

## Cómo ejecutar la aplicación

### Opción 1: Ejecución combinada (recomendado)

Ejecuta el script `start_all.ps1` que iniciará tanto el backend como el servidor de Metro para React Native:

```powershell
.\start_all.ps1
```

Después, en una terminal separada, ejecuta la aplicación en un dispositivo o emulador:

```powershell
npx react-native run-android
# O para iOS
# npx react-native run-ios
```

### Opción 2: Ejecución por separado

1. Inicia el backend:

```powershell
cd backend
npm run dev
```

2. En otra terminal, inicia Metro:

```powershell
npx react-native start
```

3. En una tercera terminal, ejecuta la aplicación:

```powershell
npx react-native run-android
# O para iOS
# npx react-native run-ios
```

## Rutas API disponibles

- `POST /api/auth/register`: Registra un nuevo usuario
- `POST /api/auth/login`: Inicia sesión para usuarios
- `POST /api/auth/admin-login`: Inicia sesión para administradores
- `GET /api/auth/me`: Obtiene información del usuario actual

## Configuración IP del backend

Si estás ejecutando la aplicación en un dispositivo físico, es posible que necesites modificar la URL del backend en `frontend/services/ApiService.ts`:

```typescript
// Opciones de URL para diferentes entornos:
// 1. Localhost (para desarrollo web): 'http://localhost:5000/api'
// 2. Emulador Android: 'http://10.0.2.2:5000/api'
// 3. IP de tu máquina (para dispositivos reales): 'http://192.168.1.XX:5000/api'
private baseURL: string = 'http://10.0.2.2:5000/api';
```

Cambia la IP por la de tu red local para permitir que dispositivos físicos se conecten al backend.

## Solución de problemas

- **Error de conexión al backend**: Verifica que el backend esté ejecutándose y que la URL en `ApiService.ts` sea correcta
- **Error "Network request failed"**: Asegúrate de que el dispositivo/emulador pueda conectarse a la IP del backend
- **Error de CORS**: El backend ya tiene CORS habilitado, pero si hay problemas, verifica la configuración en `backend/src/index.js`
