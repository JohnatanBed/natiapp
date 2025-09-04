# NatiApp Backend

Este es el backend para NatiApp, implementando la lógica de autenticación y gestión de usuarios.

## Tecnologías utilizadas

- Node.js
- Express
- MongoDB
- JWT para autenticación

## Configuración

1. Instalar dependencias:

```bash
cd backend
npm install
```

2. Configurar variables de entorno:

Crea un archivo `.env` en la carpeta `backend` con el siguiente contenido:

```
MONGODB_URI=mongodb://localhost:27017/natiapp
JWT_SECRET=tu-secreto-para-jwt-seguro
PORT=5000
NODE_ENV=development
```

3. Asegúrate de tener MongoDB instalado y ejecutándose.

## Ejecución

Para desarrollo:

```bash
npm run dev
```

Para producción:

```bash
npm start
```

## API Endpoints

### Autenticación

- **Registro de usuario**: `POST /api/auth/register`
  ```json
  {
    "name": "Nombre Usuario",
    "phoneNumber": "+573123456789",
    "password": "contraseña"
  }
  ```

- **Login de usuario**: `POST /api/auth/login`
  ```json
  {
    "phoneNumber": "+573123456789",
    "password": "contraseña"
  }
  ```

- **Login de administrador**: `POST /api/auth/admin-login`
  ```json
  {
    "email": "admin@example.com",
    "password": "contraseña"
  }
  ```

### Gestión de usuarios (solo administradores)

- **Obtener todos los usuarios**: `GET /api/users`
- **Cambiar estado de usuario**: `PUT /api/users/:id/status`

## Notas

- Para crear un usuario administrador, deberás modificar directamente en la base de datos el rol del usuario a 'admin'.
