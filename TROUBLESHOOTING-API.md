# Solución de problemas de conexión API en NatiApp

## Error "Network request failed"

Si estás viendo el error `TypeError: network request failed` en tu aplicación, sigue estos pasos para solucionarlo:

## 1. Verifica que el servidor backend esté ejecutándose

Abre una terminal en la carpeta `backend` y ejecuta:

```powershell
npm run dev
```

Deberías ver un mensaje indicando que el servidor está ejecutándose en el puerto 5000.

## 2. Verifica la configuración IP en ApiService.ts

La configuración de IP debe ser diferente según estés usando:

- **Emulador Android**: usa `10.0.2.2` en lugar de `localhost`
- **Dispositivo físico**: usa la IP de tu computadora en tu red local (ej. `192.168.1.XX`)
- **Desarrollo web**: usa `localhost`

Ejecuta nuestro script para configurar automáticamente la IP:

```powershell
.\configure_ip.ps1
```

## 3. Verifica la conexión con el backend

Ejecuta:

```powershell
.\check_backend_connection.ps1
```

Este script probará la conexión con el backend y mostrará información útil para depuración.

## 4. Usa la herramienta de prueba de API en la aplicación

1. Inicia sesión en la aplicación
2. En el menú principal, selecciona "Probar API"
3. Intenta conectarte al backend usando diferentes URL

## 5. Verifica los logs para más información

Hemos mejorado el sistema de registro en el ApiService para mostrar más detalles sobre los errores de conexión. Revisa la consola de depuración para ver mensajes como:

- URL intentada
- Estado de la respuesta
- Cuerpo de la respuesta
- Posibles causas del error

## Problemas comunes y soluciones

### Error CORS (Cross-Origin Resource Sharing)

Si ves errores relacionados con CORS, verifica que el backend tenga habilitada la configuración CORS correcta. El servidor ya está configurado para permitir solicitudes desde cualquier origen durante el desarrollo.

### Problemas de firewall

En algunos casos, el firewall puede estar bloqueando las conexiones al puerto 5000. Asegúrate de que el puerto esté abierto o agrega una excepción en tu firewall.

### Errores de certificado SSL

Si estás usando HTTPS, podrías encontrar errores de certificado. Durante el desarrollo, es mejor usar HTTP.

## Contacto de soporte

Si continúas experimentando problemas, comunícate con el equipo de desarrollo para obtener asistencia adicional.
