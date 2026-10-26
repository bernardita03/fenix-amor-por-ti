# Fénix Amor por Ti — Cloudflare

Copia independiente del código recuperado de Fénix, preparada el 26-10-2026 para GitHub y Cloudflare Workers. Incluye sitio, agenda, API de reservas, comprobantes privados y panel administrativo. No está desplegada en tu cuenta todavía.

Origen verificable: proyecto Fénix `appgprj_6ab5d1f75658819180442cbc8c0a5146`, revisión `27f1f36307dd029709fa24584e3ffcb735f9882b`. La copia original en ChatGPT no se modificó. Este paquete es una adaptación posterior para otro alojamiento.

## 1. Subir a GitHub

1. Descomprime el ZIP en tu computador.
2. En https://github.com/new crea un repositorio llamado `fenix-amor-por-ti`, **Private**. Puedes dejar las opciones README, licencia y .gitignore sin marcar: ya incluimos los archivos necesarios.
3. En el repositorio vacío pulsa **uploading an existing file**. Si ya hay archivos: **Add file → Upload files**.
4. Arrastra **el contenido** de la carpeta descomprimida, incluyendo las carpetas `app`, `public`, `legacy`, `drizzle`, `db`, `tests` y `google-apps-script`. No subas el ZIP ni una carpeta contenedora adicional. En la raíz deben verse `package.json`, `package-lock.json` y `wrangler.jsonc`.
5. Incluye `.gitignore` y `.dev.vars.example`; algunos exploradores ocultan los archivos que empiezan con punto. Nunca subas `.dev.vars`, secretos o `node_modules`.
6. Pulsa **Commit changes**. El proyecto contiene menos de 100 archivos y todos pesan menos de 25 MiB, por lo que admite la carga web en un lote.

## 2. Crear los recursos en Cloudflare

Antes del primer deploy, crea los recursos en la MISMA cuenta elegida para el Worker:

- **Storage & databases → D1 → Create database**: nombre `fenix-db`. Copia su **Database ID**.
- En GitHub abre `wrangler.jsonc`, pulsa editar y sustituye `00000000-0000-4000-8000-000000000000` por ese ID. Guarda con Commit changes. El ID no es una contraseña.
- **Storage & databases → R2**: activa R2 si aún no lo está y crea un bucket de clase Standard llamado `fenix-comprobantes`. Conserva el acceso público desactivado: contiene comprobantes de clientes.

Workers y D1 tienen niveles gratuitos con límites. R2 exige activar una suscripción, puede solicitar un medio de pago y factura uso que supere su cuota incluida. Revisa lo que muestra Cloudflare antes de aceptar; este paquete no contrata servicios ni configura cargos.

La base nueva comienza vacía. Este ZIP contiene esquema y código, no una exportación de reservas ni comprobantes existentes del alojamiento anterior.

## 3. Conectar el repositorio y publicar

En Cloudflare, vuelve a **Create application / Create app → Connect GitHub**, permite el acceso al repositorio y selecciónalo. Configura:

| Campo | Valor |
| --- | --- |
| Nombre de aplicación / Worker | `fenix-amor-por-ti` |
| Rama | `main` |
| Root directory | raíz del repositorio (vacío o `/`) |
| Build command | `npm run build` |
| Deploy command | `npm run db:remote && npm run deploy` |
| Node.js | 22.13 o posterior; preferible 22 o 24 LTS |

Si el panel permite definir variables de build, puedes poner `NODE_VERSION=22`. Se instala con npm usando `package-lock.json`. No selecciones un preset de Next.js para Pages: este proyecto usa Vinext sobre Workers.

El comando de deploy primero aplica las migraciones D1 pendientes y después publica `dist/server/wrangler.json`, generado durante la compilación. Si aparece un error de permisos, el token de build debe poder desplegar Workers, acceder a R2 y editar D1. No pegues ese token en el código ni en el chat.

Cloudflare entregará una URL de la forma `https://fenix-amor-por-ti.TU-SUBDOMINIO.workers.dev`. No necesitas comprar un dominio para esa URL. Las vistas previas versionadas están desactivadas en la configuración para que no aparezcan paneles alternativos fuera de las reglas por ruta.

Hasta configurar Access, `/admin` muestra una pantalla de configuración y sus API responden 403. El público puede abrir el sitio y la agenda sin cuenta de ChatGPT.

## 4. Acceso privado para administrar

El acceso original dependía de ChatGPT. En esta copia se sustituyó por Cloudflare Access, validando la firma JWT, su emisor, audiencia, vencimiento y una lista de correos autorizados. No se aceptan cabeceras de identidad de ChatGPT ni correos sin firma.

1. Abre **Zero Trust**, crea tu nombre de equipo y elige el nivel gratuito si está disponible para tu cuenta. Si Cloudflare solicita datos de facturación, revisa el plan seleccionado antes de continuar.
2. Habilita **One-time PIN** como método de inicio de sesión si deseas recibir un código por correo.
3. Ve a **Access → Applications → Add application → Self-hosted**. Nombre: `Fénix Administración`. Usa una única aplicación para todas las rutas del panel, así comparten AUD.
4. Añade el hostname real del Worker en cuatro entradas de dominio público/ruta: `admin`, `admin/*`, `api/admin`, `api/admin/*`. Las entradas exactas cubren la raíz y las de comodín cubren sus descendientes. Si usas un dominio propio más adelante, agrega las mismas rutas para ese dominio.
5. Crea una política **Allow → Emails** que incluya únicamente los correos que administrarán las reservas. La página principal y `/agenda.html` quedan fuera de estas rutas.
6. Copia el **Application Audience (AUD) Tag** de esa aplicación y el dominio de equipo, por ejemplo `mi-equipo.cloudflareaccess.com`.
7. En GitHub edita las tres variables no secretas de `wrangler.jsonc`:

```json
"vars": {
  "ADMIN_EMAILS": "correo-autorizado@ejemplo.com,otro@ejemplo.com",
  "ACCESS_TEAM_DOMAIN": "mi-equipo.cloudflareaccess.com",
  "ACCESS_AUD": "AUD_REAL_DE_LA_APLICACION"
}
```

8. Guarda el cambio y espera el nuevo deploy. Abre `/admin`, ingresa con uno de los correos autorizados y prueba el cierre de sesión. La lista de correos del código y la política de Access deben coincidir.

No actives la protección de TODO el Worker si quieres que los clientes puedan ver la página y reservar sin autenticarse. Usa las rutas específicas de la aplicación Self-hosted.

## 5. Correo, calendario y comprobaciones finales

- Los avisos de reservas conservan el proveedor original FormSubmit y el destino `bernardita.leiva.m@gmail.com`, presente en `public/agenda.js` y `app/admin/admin-client.tsx`. Verifica que sea el destino deseado y completa la activación que solicite el proveedor al usar el nuevo dominio. El envío real no se ha probado desde Cloudflare.
- Google Calendar es opcional. El código del puente está en `google-apps-script/`. No se recuperaron las credenciales ni una URL operativa. Para conectarlo, despliega ese puente y configura `GOOGLE_CALENDAR_WEBHOOK_URL` y `GOOGLE_CALENDAR_SHARED_SECRET` como secretos del Worker. Sin ellos, la agenda utiliza sus propias reservas D1.
- Antes de recibir reservas reales, verifica en incógnito: portada y agenda públicas; panel y comprobantes privados; reserva nueva; subida de comprobante; confirmación/rechazo; recepción de correo; bloqueo de un horario ocupado. Para el panel usa solo el correo autorizado.
- Si había reservas en el sitio anterior, exporta esa base y sus objetos mediante el acceso a su alojamiento antes de retirar la versión anterior. Este paquete no contiene dichos datos y no puede certificar una sincronización entre los dos sitios.

## Desarrollo local

Requiere Node.js 22.13 o posterior.

```sh
npm ci
npm run test
npm run check
npm run db:local
npm run dev
```

Para probar el Worker compilado localmente:

```sh
npm run build
npm run preview
```

La configuración de recursos usa un ID provisional que sirve para pruebas locales. Para publicar debes reemplazarlo por el real. El panel local permanece bloqueado sin un token válido de Access; no hay un modo de acceso libre para pruebas.

Publicación alternativa desde terminal, una vez configurados los recursos:

```sh
npx wrangler login
npm run build
npm run db:remote
npm run deploy
```

## Cambios y validación de esta adaptación

Se mantuvieron los HTML, estilos, imágenes, servicios, precios, agenda y lógica de reservas del código recuperado. Se retiraron las herramientas exclusivas de alojamiento ChatGPT y archivos de ejemplo no usados. Se agregaron configuración Workers/D1/R2, dependencias fijadas en package-lock, autenticación Access y esta guía. El diseño público no se ha rediseñado.

Validación local: ver `VALIDACION.md`. Vinext conserva la versión beta que utilizaba el proyecto recuperado; compilar y probar localmente no equivale a verificar el despliegue en tu cuenta.

## Referencias oficiales

- Cargar archivos en GitHub: https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository
- GitHub y Workers Builds: https://developers.cloudflare.com/workers/ci-cd/builds/git-integration/github-integration/
- D1: https://developers.cloudflare.com/d1/get-started/
- R2: https://developers.cloudflare.com/r2/get-started/
- Access por hostname/ruta: https://developers.cloudflare.com/workers/configuration/cloudflare-access/
- Rutas de Access: https://developers.cloudflare.com/cloudflare-one/access-controls/policies/app-paths/
- Validación de tokens Access: https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/
