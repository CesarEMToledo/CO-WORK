# Configuración de Supabase (Auth + Base de datos)

Este proyecto usa **Supabase** para todo lo relacionado con usuarios: login con
correo/contraseña y con Google, y la tabla de perfiles (roles, sedes,
reservas, etc. viven en el mismo Postgres de Supabase). Esta guía es para
cualquiera del equipo que clone el repo y necesite dejarlo corriendo en su
máquina.

Proyecto de Supabase: **Co-Work** (`vwyeatsrvzwvqdomweii`) — pide acceso a
quien administre la cuenta de Supabase si no lo tienes.

## 1. Variables de entorno

Copia `.env.example` a un archivo nuevo llamado **`.env.local`** en la raíz
del proyecto (junto a `package.json`) y complétalo:

| Variable | De dónde sacarla |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://vwyeatsrvzwvqdomweii.supabase.co` (fija para este proyecto) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Dashboard de Supabase → **Project Settings → API** → "Publishable key" / "anon key" (es pública, se puede compartir) |
| `SUPABASE_SERVICE_ROLE_KEY` | Misma página → "Secret key" / "service_role" → botón "Reveal". **Es secreta**, pídesela a quien administre el proyecto por un canal privado (no por chat de grupo ni la subas al repo) |
| `DATABASE_URL` | Dashboard → **Project Settings → Database → Connection string**, pestaña **URI**, modo **Session pooler** (puerto `5432`, no el de "Transaction" en `6543`). Pide la contraseña de la base a quien administre el proyecto |

⚠️ `.env.local` ya está en `.gitignore` — nunca lo subas al repo, y nunca
pegues la `SUPABASE_SERVICE_ROLE_KEY` ni la contraseña de la base en Slack,
issues de GitHub, etc.

## 2. Instalar y preparar el proyecto

Con `.env.local` ya lleno, en orden:

```bash
npm install

# Solo en Windows si npm avisa "install-scripts blocked" para prisma:
npm install-scripts approve @prisma/engines prisma

# Genera el cliente de Prisma a partir de prisma/schema.prisma
npx prisma generate

npm run dev
```

Y entra a `http://localhost:3000/login`.

### ¿Necesito correr migraciones o el seed?

**No, si el proyecto de Supabase compartido ya tiene los datos** (que es el
caso normal: alguien del equipo ya corrió esto una vez contra el proyecto
`Co-Work`). Todos se conectan a la misma base, así que solo necesitas
`npx prisma generate` para que tu cliente local de Prisma coincida con el
esquema.

**Solo corre esto si de verdad sabes que hace falta** (por ejemplo, un
esquema nuevo que nadie ha aplicado todavía):

```bash
npx prisma migrate dev --name nombre_del_cambio
```

🚨 **`npx prisma db seed` BORRA todos los usuarios, propiedades, sedes y
reservas de la base antes de recrear los de prueba.** Como todos usamos el
mismo proyecto de Supabase, si alguien lo corre sin avisar, le borra los
datos de trabajo a los demás. Avisa en el chat del equipo antes de correrlo,
o mejor, créate tu propio proyecto de Supabase para desarrollar si necesitas
resetear datos seguido.

## 3. Usuario de prueba (seed)

Si el seed ya se corrió contra el proyecto compartido, puedes entrar con:

- **Admin (acceso total):** `admin@cowork.mx` / `Password123!`
- Admin de sede: `admin.huasteca@cowork.mx` / `Password123!`
- Agentes/brokers: `ana.ruiz@cowork.mx`, `diego.fernandez@cowork.mx`,
  `sofia.morales@cowork.mx`, `rodrigo.pena@cowork.mx` (misma contraseña)
- Varios clientes de prueba con correos `@example.com` (misma contraseña)

Esto es solo para desarrollo — **cambia o desactiva estas cuentas antes de
poner el proyecto en producción**.

## 4. Login con Google

1. En [Google Cloud Console](https://console.cloud.google.com/), crea (o usa)
   un proyecto → **APIs & Services → Credentials → Create credentials →
   OAuth client ID** → tipo **Web application**.
2. En **Authorized redirect URIs** agrega exactamente:
   ```
   https://vwyeatsrvzwvqdomweii.supabase.co/auth/v1/callback
   ```
3. Copia el **Client ID** y **Client Secret** que te da Google.
4. En el dashboard de Supabase → **Authentication → Providers → Google**,
   activa el proveedor y pega ahí el Client ID y Client Secret. Guarda.
5. Ya no necesitas cambiar nada en el código — el botón "Continuar con
   Google" en `/login` empieza a funcionar en cuanto el proveedor queda
   activo en Supabase.

## 5. Login con Apple (no está habilitado por ahora)

El botón de Apple se quitó de `/login` porque requiere una cuenta de **Apple
Developer** de pago (~$99 USD/año) que el proyecto no tiene todavía. Si más
adelante se consigue esa cuenta, así se agrega de nuevo:

1. En [developer.apple.com](https://developer.apple.com/account) crea:
   - Un **App ID** con la capacidad "Sign in with Apple" activada.
   - Un **Services ID** (formato `com.tuempresa.app.web`), vinculado a ese
     App ID.
   - En la configuración del Services ID, agrega como dominio
     `vwyeatsrvzwvqdomweii.supabase.co` y como "Return URL":
     ```
     https://vwyeatsrvzwvqdomweii.supabase.co/auth/v1/callback
     ```
   - Una **Key** (Keys → +) con "Sign in with Apple" habilitado; descarga el
     archivo `.p8` (solo se puede descargar una vez, guárdalo bien) y anota
     su **Key ID**.
   - Tu **Team ID** (esquina superior derecha del portal, 10 caracteres).
2. En Supabase → **Authentication → Sign In / Providers → Apple**, activa el
   proveedor y llena: Client ID (el Services ID), Team ID, Key ID, y el
   contenido de la clave `.p8`.
3. En el código, `supabase.auth.signInWithOAuth({ provider: "apple" })` ya
   funcionaba antes (se puede recuperar del historial de git en
   `app/login/page.tsx`) — solo falta volver a poner el botón.

## 6. Perfil de usuario (nombre, foto, teléfono, contraseña)

Cualquier cuenta puede editar su propio perfil en `/perfil`: nombre, foto,
número de celular y contraseña. Esto necesita dos cosas que no vienen solas
al clonar el repo:

1. **La migración que agrega `phone` y `avatarUrl` a la tabla `User`** — si
   el proyecto compartido ya la tiene aplicada, a ti solo te falta
   `npx prisma generate` (paso 2). Si nadie la ha aplicado todavía:
   ```bash
   npx prisma migrate dev --name add_profile_fields
   ```
2. **El bucket de Supabase Storage donde se guardan las fotos** — este
   script lo crea junto con los permisos correctos (que cada quien solo
   pueda subir/borrar su propia foto, aunque cualquiera pueda verla). Se
   corre una sola vez por proyecto de Supabase:
   ```bash
   npm run setup:avatars
   ```
   Es seguro volver a correrlo si no estás seguro de si ya se hizo — no
   duplica nada.

## 7. Fotos al publicar una propiedad

En `/publicar`, las fotos se suben directo desde el navegador (arrastrando o
eligiendo archivos) — ya no se pide pegar una URL de imagen. Publicar una
propiedad no requiere iniciar sesión, así que el bucket donde se guardan
estas fotos permite que cualquiera suba (no solo el dueño, como sí pasa con
el bucket `avatars`). Es un solo bucket compartido, público para lectura.

Como con el de avatares, este bucket se crea una sola vez por proyecto de
Supabase:

```bash
npm run setup:property-photos
```

Es seguro volver a correrlo si no estás seguro de si ya se hizo.

## 8. Antes de desplegar a producción

En Supabase → **Authentication → URL Configuration**, agrega el dominio real
(por ejemplo `https://co-work.mx`) tanto en "Site URL" como en "Redirect
URLs" — si no, Google/Apple/la confirmación de correo van a redirigir mal en
producción.

## 9. Problemas que ya nos salieron (y cómo se resolvieron)

Si te topas con alguno de estos, ya sabemos la causa:

- **`Error: The datasource.url property is required...` al correr
  `prisma migrate dev`** → `DATABASE_URL` no está en `.env.local`, o el
  archivo no se llama exactamente `.env.local` (cuidado con Notepad
  guardando `.env.local.txt`).
- **`npm warn install-scripts ... blocked`** → corre
  `npm install-scripts approve @prisma/engines prisma` (ver paso 2).
- **El cliente de Prisma sigue pidiendo un campo viejo (`passwordHash`) o no
  reconoce uno nuevo** → el cliente generado está desactualizado, corre
  `npx prisma generate` a mano.
- **`{"code":400,"error_code":"validation_failed","msg":"Unsupported
  provider..."}` al usar un botón de login social** → ese proveedor todavía
  no está activado en Supabase (ver paso 4; Apple no está habilitado, ver
  paso 5).
- **`This module cannot be imported from a Client Component...` al correr
  el seed** → ya está resuelto en el código (no debe reaparecer); si vuelve
  a salir, revisa que `lib/supabase/admin.ts` no tenga `import "server-only"`.
- **`Unknown argument 'phone'. Did you mean 'role'?`** (o cualquier campo
  nuevo del schema que Prisma "no reconoce")** → el cliente de Prisma no se
  regeneró después de un cambio al schema. Corre `npx prisma generate` y
  reinicia `npm run dev`.
- **Después de que agregué o cambié `proxy.ts` (o cualquier página nueva),
  sigo viendo el comportamiento viejo / me manda al login sin razón** →
  borra la carpeta `.next` (`Remove-Item -Recurse -Force .next` en
  PowerShell) y vuelve a correr `npm run dev`. El servidor de desarrollo no
  siempre recompila el proxy/middleware solo.
- **Al publicar una propiedad, las fotos no se suben** → falta correr
  `npm run setup:property-photos` (ver sección 7) para crear el bucket.

## 10. Cómo está armada la autenticación (para quien vaya a tocar el código)

- `lib/supabase/client.ts` / `server.ts` — clientes de Supabase para
  Client Components y para Server Components/Route Handlers, respectivamente.
- `lib/supabase/admin.ts` — cliente con la Service Role Key (solo backend:
  crear usuarios, sincronizar roles). Nunca se importa desde un componente
  de cliente.
- `lib/supabase/middleware.ts` + `proxy.ts` — protegen `/admin` (solo rol
  `admin`) y `/reportes` (cualquier sesión), revisando la sesión de Supabase
  en cada request.
- `lib/current-user.ts` — junta la sesión de Supabase con el perfil de la
  tabla `User` (rol, sede, etc.). Lo usa `lib/permissions.ts`.
- `lib/sync-profile.ts` — crea la fila en `User` la primera vez que alguien
  entra (registro por correo o primer login con Google).
- El rol de cada usuario se guarda también en el `app_metadata` de Supabase
  Auth (vía `setUserRoleClaim`) para que `proxy.ts` pueda autorizar `/admin`
  sin tener que consultar la base en cada request.
- `prisma/schema.prisma` — el modelo `User` usa `authId` (el id del usuario
  en Supabase Auth) en vez de `passwordHash`; Supabase es quien guarda la
  contraseña. También tiene `phone` y `avatarUrl` (opcionales) para el
  perfil.
- `app/perfil/page.tsx` — página protegida (ver `proxy.ts`) que muestra el
  formulario de perfil con los datos actuales del usuario.
- `components/ProfileForm.tsx` — formulario (Client Component) para editar
  nombre, teléfono, foto y contraseña. La foto se sube directo a Supabase
  Storage (bucket `avatars`) desde el navegador; nombre/teléfono se guardan
  vía `PATCH /api/profile`; la contraseña se cambia con
  `supabase.auth.updateUser({ password })` directamente contra Supabase.
- `app/api/profile/route.ts` — el único endpoint que puede modificar nombre/
  teléfono/foto, y solo los del usuario que hace la petición (usa
  `requireSession()` de `lib/permissions.ts`); nunca toca `role`, `status`
  ni `siteId`.
- `scripts/setup-avatars-storage.ts` — crea el bucket `avatars` y las
  políticas de Storage la primera vez (ver sección 6).
- `components/ImageUploadField.tsx` — selector de fotos (arrastrar/elegir
  archivo) usado en `/publicar`; sube cada foto directo a Supabase Storage
  (bucket `property-photos`) desde el navegador y guarda las URLs públicas
  resultantes en el formulario.
- `scripts/setup-property-photos-storage.ts` — crea el bucket
  `property-photos` (público para subir y leer, ver sección 7).
- `lib/image-compress.ts` — antes de subir cualquier foto (perfil o
  propiedad), la reduce de tamaño y la convierte a WebP en el navegador del
  usuario, sin que se note la diferencia a simple vista. Así ocupan mucho
  menos espacio en Supabase Storage. Si algo falla (navegador viejo, etc.)
  sube la foto original tal cual, nunca bloquea al usuario.
