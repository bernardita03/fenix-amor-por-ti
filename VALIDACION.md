# Validación de la adaptación Cloudflare

Fecha: 26 de octubre de 2026.

- `npm install`: correcto; dependencias registradas en `package-lock.json`.
- `npm run build`: correcto. Generó Worker en `dist/server` y recursos en `dist/client`.
- `npm run check`: TypeScript correcto.
- `npm run test`: 3 pruebas correctas. Token firmado válido; rechazo de tokens ausentes, falsos o firmados con otra clave; rechazo por emisor, audiencia, vencimiento o correo no autorizado.
- Migración SQL aplicada correctamente sobre D1 local.
- Worker compilado ejecutado localmente con D1 y R2 simulados por Wrangler.
- Portada, agenda y pantalla de acceso administrativo: HTTP 200.
- Listado administrativo, cambio de estado y lectura de comprobantes: HTTP 403 sin sesión válida, incluso enviando una cabecera de identidad ChatGPT o un JWT falso.
- Disponibilidad consultada correctamente.
- Reserva de prueba ficticia: HTTP 201.
- Intento de reservar nuevamente el mismo horario: HTTP 409.
- Carga de archivo de prueba en el bucket R2 local: HTTP 200.
- Los HTML, estilos, imágenes y JavaScript públicos se compararon con el código de origen para comprobar que la adaptación no alteró la presentación pública.

Las pruebas de reservas usaron exclusivamente almacenamiento local y datos ficticios. No se enviaron avisos de correo ni se creó ningún recurso o cobro en Cloudflare.

## Pendientes externos

Aún no se verifican: creación del repositorio del usuario, despliegue en su cuenta de Cloudflare, facturación/activación R2, autenticación real de Access por correo, correo FormSubmit, Google Calendar y recuperación de reservas/comprobantes del alojamiento anterior. Se requieren los recursos y la configuración descritos en README.md.

No se incluye la base de pruebas, `node_modules`, archivos compilados ni datos operativos del alojamiento original.
