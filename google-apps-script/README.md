# Conexión con Google Calendar

El archivo `Code.gs` se publica como aplicación web en Google Apps Script usando la cuenta propietaria del calendario.

Configura el proyecto con la zona horaria `America/Santiago` y agrega estas propiedades del script:

- `CALENDAR_ID`: `primary`
- `SHARED_SECRET`: el mismo secreto configurado en el sitio

La aplicación web debe ejecutarse como la propietaria del script. La URL terminada en `/exec` se guarda en el sitio como `GOOGLE_CALENDAR_WEBHOOK_URL`.
