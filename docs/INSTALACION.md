# Instalar CO-WORK en una computadora nueva

Guía para cualquier persona del equipo que vaya a clonar el proyecto y
dejarlo corriendo en su máquina por primera vez. Si ya lo tienes instalado y
solo buscas algo puntual de Supabase (Google, fotos de perfil, errores ya
conocidos), consulta [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md) — este
documento es el punto de partida general; ese otro es el detalle de la parte
de Supabase.

## 1. Antes de empezar

Necesitas, antes de clonar nada:

- **Node.js 20.9 o más reciente** — instálalo desde
  [nodejs.org](https://nodejs.org/) (elige la versión "LTS"). Verifica con
  `node -v` en una terminal.
- **Git** — [git-scm.com](https://git-scm.com/downloads). Verifica con
  `git --version`.
- Un editor de código. Recomendado: [VS Code](https://code.visualstudio.com/).
- **Acceso al repositorio de GitHub**: pídele a Cesar que te agregue como
  colaborador en `https://github.com/CesarEMToledo/CO-WORK`.
- **Acceso al proyecto de Supabase compartido "Co-Work"**: pídele a Cesar
  que te invite desde el dashboard de Supabase, o que te pase las variables
  de entorno por un canal privado (ver paso 4 — nunca por chat de grupo).

## 2. Clonar el repositorio

En la carpeta donde quieras guardar el proyecto:

```bash
git clone https://github.com/CesarEMToledo/CO-WORK.git
cd CO-WORK
```

## 3. Instalar las dependencias

```bash
npm install
```

⚠️ **Solo en Windows**, si al correr esto ves un aviso como
`npm warn install-scripts ... blocked`, corre:

```bash
npm install-scripts approve @prisma/engines prisma
```

y vuelve a correr `npm install`.

No uses `yarn`, `pnpm` ni `bun` — el proyecto usa `npm` (hay un
`package-lock.json` en el repo) y mezclar gestores de paquetes puede causar
problemas raros.

## 4. Configurar las variables de entorno

Copia `.env.example`, ponle de nombre **`.env.local`** (exactamente así, sin
`.txt` al final — cuidado si lo creas con el Bloc de notas) y llena los
valores. Todos los detalles de dónde sacar cada uno están en
[`SUPABASE_SETUP.md` — sección 1](./SUPABASE_SETUP.md#1-variables-de-entorno):

| Variable | Para qué es |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto de Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Llave pública de Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Llave secreta de Supabase (solo backend) |
| `DATABASE_URL` | Conexión a la base de datos Postgres del proyecto |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Opcional — sin esto, el mapa de `/explorar` usa Leaflet automáticamente, sin necesidad de ninguna llave |

⚠️ `.env.local` nunca se sube a git (ya está en `.gitignore`) y nunca debe
compartirse por Slack, WhatsApp, issues de GitHub, etc. — pide esos valores
por un canal privado.

## 5. Preparar la base de datos (Prisma)

```bash
npx prisma generate
```

Esto genera el cliente de Prisma en tu máquina a partir de
`prisma/schema.prisma` (esa carpeta generada no se sube a git, cada quien la
genera localmente). **No necesitas correr migraciones ni el seed** — el
proyecto de Supabase compartido ya tiene la base de datos y los datos de
prueba listos; te conectas directo a esa misma base.

🚨 Nunca corras `npx prisma db seed` en la base compartida sin avisar en el
chat del equipo — borra todos los usuarios, propiedades y reservas antes de
recrear los de prueba, y le borraría el trabajo a los demás. Más detalle en
[`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md).

## 6. Levantar el proyecto

```bash
npm run dev
```

Entra a [http://localhost:3000](http://localhost:3000). Para iniciar sesión,
usa alguna de las cuentas de prueba (todas con la contraseña
`Password123!`):

- **Admin:** `admin@cowork.mx`
- Otras cuentas (agentes, clientes, etc.): ver
  [`SUPABASE_SETUP.md` — sección 3](./SUPABASE_SETUP.md#3-usuario-de-prueba-seed).

## 7. Cosas que solo hay que hacer UNA VEZ por proyecto de Supabase (no por persona)

Estas dos ya deberían estar hechas si alguien del equipo las corrió antes
contra el proyecto compartido — no hace falta que las repitas. Sirven para
que las fotos (de perfil y de propiedades) tengan dónde guardarse:

```bash
npm run setup:avatars
npm run setup:property-photos
```

Son seguras de volver a correr si no estás seguro/a de si ya se hicieron —
no duplican ni borran nada.

## 8. Mapa rápido del proyecto

- `app/` — páginas y rutas (Next.js App Router). Por ejemplo `app/login`,
  `app/perfil`, `app/admin`, `app/api/...`.
- `components/` — piezas de interfaz reutilizables (formularios, Navbar,
  tarjetas de propiedad, etc.).
- `lib/` — lógica compartida: clientes de Supabase, permisos, utilidades.
- `prisma/schema.prisma` — la estructura de la base de datos.
- `data/mockProperties.ts` — catálogo de propiedades de ejemplo (el
  formulario de "Publicar propiedad" guarda ahí mismo, en el navegador del
  usuario — no en la base de datos compartida).
- `docs/` — esta guía y `SUPABASE_SETUP.md`.

## 9. Si algo sale mal

Casi todos los errores ya nos han pasado antes — la lista completa con la
causa de cada uno está en
[`SUPABASE_SETUP.md` — sección "Problemas que ya nos salieron"](./SUPABASE_SETUP.md).
Los más comunes al instalar por primera vez:

- **`The datasource.url property is required...`** → revisa que `.env.local`
  exista (exactamente con ese nombre) y tenga `DATABASE_URL` lleno.
- **`npm warn install-scripts ... blocked`** (Windows) → ver paso 3.
- **Prisma dice que falta o no reconoce un campo** → corre
  `npx prisma generate` de nuevo.
- **Cambios de código que no se reflejan / te manda al login sin razón** →
  borra la carpeta `.next` (`Remove-Item -Recurse -Force .next` en
  PowerShell, o `rm -rf .next` en Mac/Linux) y vuelve a correr `npm run dev`.

## 10. Antes de subir cambios (buenas prácticas del equipo)

- Nunca subas `.env.local` ni ningún valor secreto a git.
- Nunca corras `npx prisma db seed` contra el proyecto compartido sin avisar
  antes en el chat del equipo.
- Si cambias `prisma/schema.prisma`, corre
  `npx prisma migrate dev --name algo_descriptivo` y avisa en el chat del
  equipo para que los demás sepan que hay una migración nueva que aplicar
  (con `npx prisma migrate dev` de nuevo de su lado, o `npx prisma generate`
  si solo cambió el cliente).
