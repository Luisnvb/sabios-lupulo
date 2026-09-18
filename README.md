# Sábios del Lúpulo Simulator

Recrea las partidas de trivial por equipos que "Los Sábios del Lúpulo" juegan
los jueves en Checkpoint Arcade (Sevilla). Next.js (App Router) + TypeScript +
Drizzle ORM + PostgreSQL (Neon), tomando [trivia-friends](../trivia-friends)
como referencia de arquitectura.

## Categorías

1. Geografía
2. Arte y Literatura
3. Historia
4. Entretenimiento / Espectáculos
5. Ciencias y Naturaleza
6. Deportes
7. Diversión con banderas (identificar el país por su bandera)
8. Animalitos (identificar el animal por su foto)

~100 preguntas por categoría (~800 en total). Las preguntas de tipo test
tienen 4 opciones; las de banderas y animalitos muestran además una imagen.

## Puesta en marcha

1. `npm install`
2. Vincular un proyecto Neon (ver más abajo) y copiar la connection string a
   `.env.local` (a partir de `.env.local.example`).
3. Aplicar las migraciones:
   ```
   npm run db:generate
   npm run db:migrate
   ```
4. Cargar el banco de preguntas (~800 filas; resuelve las fotos de
   animalitos consultando la Wikipedia en español en el momento del seed):
   ```
   npm run db:seed
   ```
5. `npm run dev` y abrir `http://localhost:3000`.

## Gestionar preguntas (`/questions`)

Además del banco cargado por el seed, las preguntas se pueden listar,
crear, editar y borrar desde el navegador en `/questions`:

- Listado con búsqueda, filtro por categoría/dificultad, orden y paginación
  (`src/app/questions/page.tsx`).
- Crear (`/questions/new`) y editar (`/questions/[id]/edit`) comparten el
  mismo formulario (`src/components/question-form.tsx`): categoría,
  dificultad, texto, URL de imagen opcional (con vista previa) y 4 opciones
  con 1 marcada como correcta.
- Crear y editar piden la clave compartida `EDIT_PASSWORD` (variable de
  entorno, ver `.env.local.example`); borrar solo pide confirmación. No es
  un sistema de usuarios, solo evita ediciones accidentales.

## Base de datos (Neon)

Este proyecto usa [Neon](https://neon.tech) como Postgres, gestionado con el
CLI oficial (`neon`) y `neon.ts` (configuración declarativa):

```
neon link --project-id <tu-project-id> --branch production -y
neon config init
neon deploy
```

## Imágenes

- **Banderas**: se generan en el seed a partir del código ISO 3166-1 alpha-2
  de cada país, vía [flagcdn.com](https://flagcdn.com) — no hay URLs de
  imagen hardcodeadas en los datos.
- **Animalitos**: se resuelven en el seed consultando en vivo la miniatura
  de la infobox del artículo correspondiente en Wikipedia en español (API
  `pageimages`), por el mismo motivo.
- **Imagen de portada**: `public/team-illustration.png`, una ilustración
  estilo cómic generada a partir de `foto-equipo.jpg` (ver
  `../foto-equipo.jpg`) con un filtro de posterizado + detección de bordes
  (script ad-hoc, no versionado en el repo).

## Estructura (heredada de trivia-friends)

- `src/db/schema.ts`: tablas `question` / `answer_option`.
- `src/db/data/*.ts`: banco de preguntas por categoría (una por categoría,
  ~100 preguntas cada una).
- `src/db/seed.ts`: inserta todo el banco, construye/resuelve imágenes.
- `src/lib/dal/questions.ts`: única capa con acceso a Postgres.
- `src/app/play`: configuración de partida (nº de preguntas, categorías) y
  sesión de juego (`src/components/game-player.tsx`).
- `src/app/categorias`: listado de categorías con nº de preguntas cargadas
  (cada una enlaza a `/questions?category=...`).
- `src/app/questions`: CRUD completo (listado/crear/editar/borrar), Server
  Actions en `src/app/questions/actions.ts`, validación en
  `src/lib/validation/question.ts`, clave compartida en
  `src/lib/auth/edit-key.ts`.

Despliegue previsto en Vercel; configurar `DATABASE_URL` como variable de
entorno del proyecto en Vercel (no versionar `.env.local`).
