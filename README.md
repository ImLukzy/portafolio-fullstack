# Portafolio · Lukas Melgar Casimiro

SPA pública (React + Vite + Tailwind + Motion) y CMS privado en `/admin`, con base de datos en **Neon PostgreSQL** (Prisma ORM) e imágenes en **Cloudflare R2**.

El sitio funciona desde el primer momento **sin ninguna clave**: si la base de datos aún no está configurada, la API responde 503 y la web muestra el contenido por defecto (`shared/default-content.js`, sacado de tu CV y de tu sitio anterior).

```
├── prisma/
│   ├── schema.prisma          Profile · Experience · Project · Skill · Service
│   ├── migrations/            Migración inicial (SQL)
│   └── seed.js                Carga el contenido inicial (idempotente)
├── prisma.config.ts           Conexión del CLI de Prisma (usa DIRECT_URL)
├── server/
│   ├── index.js               Arranque; en producción también sirve dist/
│   ├── app.js                 Express + manejo de errores
│   ├── db.js                  Prisma Client + adapter pg (usa DATABASE_URL)
│   ├── r2-uploader.js         Subidas a Cloudflare R2 (@aws-sdk/client-s3)
│   ├── auth.js                PIN, cookie de sesión firmada y límite de intentos
│   ├── validation.js          Esquemas Zod de todo lo que entra por la API
│   └── routes/                public.js · auth.js · admin.js
├── shared/                    Contenido por defecto y constantes (server + web)
├── src/
│   ├── site/                  Landing: Inicio, Perfil, Proyectos, Habilidades, Contacto
│   ├── admin/                 CMS: PIN, perfil, colecciones, subida de archivos
│   ├── components/ui.jsx      Botones, reveal, contadores, portadas…
│   └── styles.css             Tokens de diseño (Tailwind v4 @theme)
├── legacy/                    Tu sitio estático anterior (intacto)
└── .env.example               Plantilla de variables de entorno
```

---

## 0. Arranque en local

Requisitos: **Node.js 22.18 o superior** (tienes 24).

```bash
npm install
cp .env.example .env        # en PowerShell:  Copy-Item .env.example .env
npm run dev
```

- Web: http://localhost:5173 (si el puerto está ocupado, Vite usa el siguiente; mira la consola)
- API: http://localhost:3001
- CMS: http://localhost:5173/admin

Al arrancar, la API muestra qué integraciones están listas:

```
  API lista en http://localhost:3001
  ✗ Neon (DATABASE_URL)
  ✗ Cloudflare R2
  ✗ PIN de administración
```

Ve rellenando `.env` con los pasos siguientes y reinicia `npm run dev` después de cada cambio.

---

## 1. PIN del panel de administración

En `.env`:

```env
ADMIN_PIN="…"                            # PIN o contraseña, mín. 4 caracteres
ADMIN_SESSION_SECRET="…"                 # cadena aleatoria larga
```

Genera el secreto con:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Seguridad incluida: la sesión es una cookie `httpOnly` + `SameSite=Strict` firmada con HMAC (8 h), y tras 5 PIN incorrectos esa IP queda bloqueada 15 minutos.

---

## 2. Neon PostgreSQL

1. Entra en https://console.neon.tech y crea un proyecto (región recomendada para Perú: **AWS São Paulo · sa-east-1**).
2. En el dashboard del proyecto pulsa **Connect**.
3. Con **Connection pooling ACTIVADO**, copia la cadena → `DATABASE_URL` (su host contiene `-pooler`).
4. Con **Connection pooling DESACTIVADO**, copia la cadena → `DIRECT_URL`.

```env
DATABASE_URL="postgresql://neondb_owner:xxxx@ep-nombre-123456-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
DIRECT_URL="postgresql://neondb_owner:xxxx@ep-nombre-123456.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
```

> ¿Por qué dos URLs? La app usa el pooler (muchas conexiones cortas); las migraciones necesitan la conexión directa.

> ⚠️ **Base de datos exclusiva.** Si usas el mismo proyecto Neon para otra app (p. ej. Universo Agustino), el portafolio debe tener **su propia base**: `CREATE DATABASE portafolio` y `/portafolio` en lugar de `/neondb` en ambas URLs. Si dos apps con Prisma comparten base, las migraciones de una borran las tablas de la otra.

5. Crea las tablas y carga tu contenido inicial:

```bash
npm run db:deploy     # aplica prisma/migrations a Neon
npm run db:seed       # inserta perfil, trayectoria, proyectos, habilidades y servicios
```

El seed es idempotente: si una tabla ya tiene datos no la toca, así que nunca pisa lo que edites en el CMS. Para borrar todo y volver al contenido inicial: `npm run db:seed:reset`.

Reinicia `npm run dev`: debería aparecer `✓ Neon (DATABASE_URL)`. Desde ese momento todo el contenido sale de Neon.

---

## 3. Cloudflare R2 (imágenes y CV)

1. Dashboard de Cloudflare → **R2 Object Storage** → **Create bucket** (p. ej. `portafolio-lukas`).
   → `R2_BUCKET_NAME`
2. Copia tu **Account ID** (aparece en la página principal de R2).
   → `CLOUDFLARE_ACCOUNT_ID`
3. Haz el bucket público para que las imágenes se vean en la web. Dentro del bucket → **Settings**:
   - **Public Development URL → Enable** para obtener `https://pub-xxxxxxxx.r2.dev` (sirve para empezar; tiene límite de tráfico), o
   - **Custom Domains → Connect Domain** (recomendado en producción), p. ej. `https://cdn.tudominio.com`.
   → `R2_PUBLIC_URL` (sin barra final)
4. R2 → **Manage API tokens** → **Create API token**:
   - Permisos: **Object Read & Write**
   - Alcance: **solo este bucket**
   - Copia **Access Key ID** y **Secret Access Key** (el secreto solo se muestra una vez).
   → `R2_ACCESS_KEY_ID` y `R2_SECRET_ACCESS_KEY`

```env
CLOUDFLARE_ACCOUNT_ID="0123456789abcdef0123456789abcdef"
R2_ACCESS_KEY_ID="…"
R2_SECRET_ACCESS_KEY="…"
R2_BUCKET_NAME="portafolio-lukas"
R2_PUBLIC_URL="https://pub-xxxxxxxxxxxxxxxx.r2.dev"
```

Reinicia y comprueba en `/admin` (abajo a la izquierda) que **Cloudflare R2** dice *Configurado*. Luego sube una imagen de prueba en cualquier proyecto.

Detalles del uploader (`server/r2-uploader.js`):
- Carpetas: `projects/` y `profile/` (JPG, PNG, WebP, AVIF, GIF) y `documents/` (PDF). Máximo 8 MB.
- Nombres únicos (`projects/2026/<uuid>.webp`) con caché inmutable de 1 año.
- Al reemplazar o borrar una imagen desde el CMS se elimina también de R2.
- Sin R2 configurado puedes pegar URLs de imagen directamente.

---

## 4. Uso del CMS (`/admin`)

| Sección | Qué controla |
| --- | --- |
| **Perfil** | Nombre, rol, foto, textos del inicio, biografía, enfoque, fortalezas, contacto, WhatsApp, redes y CV |
| **Trayectoria** | Hitos de "Mi trayectoria" |
| **Proyectos** | Tarjetas, portada, categorías (generan los filtros), tecnologías, enlaces. Uno puede ser **destacado**; el ojo oculta/publica |
| **Habilidades** | Tres pestañas: *Habilidades técnicas* (medidores circulares), *Stack* (barras) y *Herramientas*. "Mostrar en el inicio" las pone en la cuadrícula del hero |
| **Servicios** | Tarjetas de "Servicios que ofrezco", con icono |

Las filas se reordenan **arrastrando el asa** (⋮⋮) o, con teclado, enfocando el asa y usando ↑/↓. El orden se guarda solo. Los cambios se ven en la web al recargar.

---

## 5. Despliegue en producción (un solo servicio Node)

Recomendado: **Render** (Web Service), Railway o Fly.io. El mismo proceso sirve la API y la SPA compilada.

| Ajuste | Valor |
| --- | --- |
| Build command | `npm install && npm run build && npm run db:deploy` |
| Start command | `npm start` |
| Variables | Todas las de tu `.env` + **`NODE_ENV=production`** |

`NODE_ENV=production` es importante: activa la cookie `Secure` (solo HTTPS). No definas `PORT` en Render: la plataforma lo inyecta.

---

## 6. Añadir un campo nuevo (sin tocar el diseño)

1. `prisma/schema.prisma` → añade el campo y ejecuta `npm run db:migrate -- --name nombre_del_cambio`.
2. `server/validation.js` → añade la regla Zod.
3. `src/admin/config.js` → añade el campo al formulario (tipos: `text`, `textarea`, `url`, `email`, `list`, `toggle`, `range`, `select`, `image`, `file`, `icon`).
4. Úsalo en el componente de `src/site/sections/`.

---

## Diseño y animación

- **Cero saltos de layout** (CLS medido = 0): la página se pinta de una vez con datos y fuentes ya cargados; las animaciones solo usan `opacity`/`transform`/`clip-path`; las imágenes tienen caja de tamaño fijo; `scrollbar-gutter: stable` evita saltos al abrir modales; al filtrar proyectos la cuadrícula conserva su altura, así que las secciones de abajo no se mueven.
- **Movimiento**: curvas `cubic-bezier(0.23, 1, 0.32, 1)` para entradas y muelles amortiguados para indicadores (pill del menú, filtros, pestañas). Las salidas son más rápidas que las entradas. Se respeta "reducir movimiento" del sistema.
- **Tokens**: todos los colores, tipografías y curvas viven en `src/styles.css` (`@theme`). Acento lila `#a78bfa`, fondo `#07070b`, Inter Variable + Instrument Serif itálica.

## Escala 125 % del sitio público

En escritorio (≥ 1024 px) el sitio público se muestra al 125 %, como con el zoom del navegador; **`/admin` no se escala**.

- Un script en `index.html` añade `html.site-scale` antes del primer pintado (nunca en `/admin`) y `styles.css` fija `font-size: 125%` → 1rem = 20 px. `src/App.jsx` mantiene la clase al navegar dentro de la SPA.
- Para que todo escale en bloque, el sitio usa **rem** (no px) en tamaños, espacios y sombras. Solo los trazos finos (1–2 px) quedan en px.
- En `src/site/` usa **`site-lg:` y `site-xl:`** en lugar de `lg:`/`xl:` (breakpoints desplazados ×1,25, como hace el zoom real). `sm:` y `md:` no cambian. El admin sigue con los breakpoints estándar.
- Para otra escala (p. ej. 110 %), cambia `font-size` en `html.site-scale` y los valores `--breakpoint-site-lg/xl` y los cortes de `container-page` en `src/styles.css` (64rem × escala, 80rem × escala).

## Problemas frecuentes

- **`No se pudo iniciar en el puerto 3001`** → otro programa usa ese puerto: cambia `PORT` en `.env`.
- **El sitio muestra los datos de ejemplo** → la API no llega a Neon: revisa `DATABASE_URL` y que hayas corrido `npm run db:deploy` y `npm run db:seed`.
- **Las imágenes subidas no se ven** → falta hacer público el bucket o `R2_PUBLIC_URL` no coincide con su URL pública.
- **npm avisa de "install scripts"** → los de Prisma ya están aprobados en `allowScripts` del `package.json`.
- **La carpeta está en OneDrive** → `node_modules` tiene miles de archivos; si la sincronización va lenta, mueve el proyecto fuera de OneDrive.
