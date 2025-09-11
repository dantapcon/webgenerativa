# Manual de Desarrollador — webgenerativa

Última actualización: 11 de septiembre de 2025

Este documento es el manual de programación/desarrollador del proyecto `webgenerativa`. Contiene dependencias, ejecución, estructura del repositorio, esquema de base de datos, contratos de API, flujo de autenticación, RLS y buenas prácticas, pasos para desarrollar nuevas funcionalidades y soluciones a errores comunes.

---

## Índice

1. Resumen del proyecto
2. Stack y dependencias
3. Variables de entorno
4. Comandos de desarrollo y despliegue
5. Estructura del repositorio (archivos y carpetas clave)
6. Esquema de base de datos y tablas relevantes
7. Flujo de autenticación (uso recomendado: Supabase Auth)
8. Endpoints API importantes (contratos)
9. Servicios y componentes principales (qué hacen y dónde)
10. RLS y seguridad: prácticas y ejemplos
11. Errores comunes y resolución rápida
12. Desarrollo de la sección "Servicios y Productos"
13. Tests, lint y CI/CD
14. SQL y scripts útiles incluidos en el repo
15. Checklist de tareas para continuar
16. Conversión a PDF

---

## 1) Resumen del proyecto

`webgenerativa` es un generador de sitios para empresas/clinicas con administración por página. El proyecto usa Next.js (App Router) con TypeScript y Supabase (Postgres + Auth). La idea central es que cada empresa tenga administración propia (login, permisos) para editar su contenido.


## 2) Stack y dependencias

- Node.js 18+ (recomendado)
- npm (o pnpm/yarn)
- Next.js v15 (Turbopack)
- TypeScript
- TailwindCSS
- supabase-js (@supabase/supabase-js)
- @supabase/ssr (para createBrowserClient / createServerClient)
- Lucide-react y otras librerías UI

Dependencias principales están en `package.json`.


## 3) Variables de entorno

Archivo: `.env.local` (local dev) — **NO** subir a repos públicos.

Variables mínimas:

- NEXT_PUBLIC_SUPABASE_URL=https://<tu-proyecto>.supabase.co
- NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key-public>
- SUPABASE_SERVICE_ROLE_KEY=<service_role_secret>  # *solo server*
- NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=<tu-api-google>

Notas:
- `SUPABASE_SERVICE_ROLE_KEY` debe guardarse como secret en el host/prod y nunca exponerse en cliente.
- Si encuentras nombres antiguos (ej. NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY) unifícalos a `NEXT_PUBLIC_SUPABASE_ANON_KEY` y actualiza referencias en `lib/`.


## 4) Comandos de instalación y ejecución

Instalar dependencias:

```powershell
npm install
```

Desarrollo (hot-reload):

```powershell
npm run dev
# abre http://localhost:3000
```

Build producción y start:

```powershell
npm run build
npm run start
```

Notas:
- Reinicia el servidor dev después de cambiar `.env.local`.


## 5) Estructura del repositorio (resumen)

- `app/` — rutas de Next.js (App Router)
  - `app/[slug]/page.tsx` — página pública de empresa
  - `app/admin/empresas/[id]/editar/page.tsx` — panel administrador por empresa
  - `app/api/admin/` — endpoints API (empresas, permisos, auth)
- `components/` — componentes de UI, subcarpeta `admin/` para las UI de administración
- `lib/` — servicios y utilidades
  - `lib/services/` — lógica del negocio (admin, oftalmologia, etc.)
  - `lib/supabase/` — wrappers y helpers de supabase: `client.ts`, `server.ts`, `middleware.ts`
- `sql_migrations/`, `migrations/`, `setup_*.sql` — scripts SQL y migraciones
- `types/` — definiciones TypeScript

Archivos clave:
- `lib/services/admin-paginas.ts` — operaciones CRUD para administradores
- `components/admin/LoginAdminSupabase.tsx` — componente de login que usa Supabase Auth
- `app/api/admin/permisos/route.ts` — API que gestiona permisos (GET/POST)


## 6) Esquema de BD (tablas relevantes)

Resumen de tablas implicadas (extraído de scripts en repo). Revisa tus migraciones antes de ejecutar.

### tabla `empresas` (existente)
- id (INTEGER PK)
- nombre_empresa, slug, contacto, etc.

### tabla `admin_paginas` (opción legacy)
- id UUID PK
- email, nombre
- password_hash (si no usas Supabase Auth)
- empresa_id INTEGER REFERENCES empresas(id)
- activo BOOLEAN
- login_habilitado BOOLEAN
- created_at, updated_at

### tabla `permisos_admin_empresas` (opción legacy)
- id UUID PK
- admin_id UUID REFERENCES admin_paginas(id)
- boolean flags: puede_editar_info_basica, ...

### tabla recomendada `admin_permisos` (usando Supabase Auth)
- id UUID PK
- user_id UUID (ID de usuario en Supabase Auth)
- empresa_id INTEGER FK -> empresas(id)
- role VARCHAR (admin/editor/viewer)
- boolean flags para permisos
- UNIQUE(user_id, empresa_id)

Nota: error común — al crear filas en `admin_paginas` con empresa_id=1, la tabla `empresas` debe contener la fila con id=1 (evitar FK violations 23503).


## 7) Flujo de autenticación (recomendado)

Recomendación: usar Supabase Auth (usuarios centralizados) + `admin_permisos` para autorizar acciones por empresa.

Flujo básico:
1. Crear usuario en Dashboard Supabase (Auth → Users) o vía API (email/password).
2. Al crear usuario, obtener `user.id` (UUID) y crear fila en `admin_permisos` con `empresa_id` y permisos.
3. En cliente, usar `createBrowserClient` para signInWithPassword.
4. Tras login, comprobar `admin_permisos` para `user.id` y `empresa_id`.
5. Operaciones sensibles (crear/editar permisos) deben ejecutarse server-side con `SUPABASE_SERVICE_ROLE_KEY`.


## 8) Endpoints API (contratos)

Resumen de endpoints existentes y su contrato.

### POST `/api/admin/empresas` — crear administrador (server)
- Body: { email, nombre?, password?, empresa_id, permisos? }
- Success: 200 { admin: {...}, permisos: {...} }
- Errors: 400/500 { error: 'mensaje' }

### GET `/api/admin/permisos?user_id=&empresa_id=`
- Response: 200 { permisos: [...] }

### POST `/api/admin/permisos` — crear/actualizar permisos
- Body: { user_id, empresa_id, permisos }
- Response: 200 { permisos: {...} }

Documenta en el repo los endpoints que agregues (archivo README o swagger/openapi mínimo recomendado).


## 9) Servicios y componentes principales

- `lib/services/admin-paginas.ts` — CRUD admin (debe usarse solo server-side para operaciones con `service_role`).
- `lib/services/oftalmologia.ts` — obtiene empresas, categorías y otros datos.
- `components/admin/LoginAdminSupabase.tsx` — UI de login que realiza `supabase.auth.signInWithPassword` y luego consulta `admin_permisos`.
- `components/admin/AdminEmpresaIndividual.tsx` — gestión de un administrador por empresa (crear/editar permisos) — usa APIs server.

Tips:
- Mantén la lógica de negocio en `lib/services` y llama a estos desde las APIs y pages server-side.
- Evita importar `lib/services/admin-paginas.ts` en el bundle cliente.


## 10) RLS y seguridad

Buenas prácticas:
- Habilita RLS y crea policies granulares.
- Policies para SELECT para usuarios autenticados que cumplen una condición (por ejemplo, que en `admin_permisos` exista la relación user/empresa).
- Usa `SUPABASE_SERVICE_ROLE_KEY` para tareas administrativas en server-only.
- No uses service-role en código cliente.

Ejemplo de policy (pseudocódigo):

- Permitir SELECT en `admin_permisos` a usuarios donde `auth.uid() = admin_permisos.user_id` o cuando `auth.role() = 'service_role'`.

Si quieres, puedo generar SQL concreto de policies acorde tu esquema.


## 11) Errores comunes y soluciones

- Unexpected token '<' (HTML en vez de JSON): endpoint devolvió HTML (error 500). Revisa logs del servidor y el endpoint.
- supabaseKey is required: variable env faltante o con nombre equivocado. Verifica `.env.local` y reinicia.
- TypeError: fetch failed: problemas de conectividad, URL incorrecta o DNS.
- FK violation 23503 (empresa_id not present): crear la empresa o usar empresa_id correcto antes de insertar admin.
- RLS bloqueando operaciones: revisar policies o usar service_role desde server.


## 12) Cómo desarrollar "Servicios y Productos" (pasos concretos)

1. Modelo BD: crear `servicios` y `productos` con `empresa_id` FK.

```sql
CREATE TABLE servicios (
  id SERIAL PRIMARY KEY,
  empresa_id INTEGER REFERENCES empresas(id),
  titulo TEXT,
  descripcion TEXT,
  precio NUMERIC,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

2. API endpoints CRUD: `app/api/empresas/[id]/servicios/route.ts` (GET, POST, PUT, DELETE).
3. UI admin: componente lista + modal formulario (usar `AdminEmpresaIndividual` como plantilla).
4. Permisos: agregar flags en `admin_permisos` para `puede_editar_servicios` y `puede_editar_productos`.


## 13) Tests, lint y CI

- Añadir ESLint y Prettier (si no están). Ejecutar `npm run lint` antes de commits.
- Tests unitarios: `vitest` o `jest` para servicios; `testing-library/react` para componentes.
- CI: GitHub Actions con pasos: `npm ci`, `npm run build`, `npm test`.


## 14) SQL y scripts útiles incluidos

Archivos importantes ya en repo:
- `setup_admin_final.sql` — crea `admin_paginas` y `permisos_admin_empresas` (legacy)
- `auth_system_supabase.sql` — crea `admin_permisos` para usar con Supabase Auth (recomendado)
- `opcion1_admin_simple.sql` — tabla simplificada para pruebas rápidas
- `fix_rls_policies.sql` / `fix_rls_script.js` — scripts usados para depurar políticas (usar con cuidado)


## 15) Checklist para continuar (acciones recomendadas ahora)

- [ ] Elegir flujo de autenticación (legacy `admin_paginas` o recomendado `Supabase Auth + admin_permisos`).
- [ ] Crear tablas necesarias en Supabase (usar `auth_system_supabase.sql` si eliges Auth).
- [ ] Añadir usuario admin en Dashboard (Auth → Users) y copiar `user_id`.
- [ ] Insertar fila en `admin_permisos` para ese `user_id` + `empresa_id`.
- [ ] Reiniciar `npm run dev` y probar login en la página de la empresa.


## 16) Conversión a PDF

He generado este manual en formato Markdown. Puedes convertirlo a PDF localmente con `pandoc` o con un paquete npm.

Comando usando `pandoc` (si lo tienes instalado):

```powershell
pandoc DEVELOPER_MANUAL.md -o DEVELOPER_MANUAL.pdf
```

Comando usando `npx` con `markdown-pdf` (puede instalarse automáticamente):

```powershell
npx markdown-pdf DEVELOPER_MANUAL.md -o DEVELOPER_MANUAL.pdf
```

---

Si quieres, creo también el PDF aquí en el repo (necesito que me confirmes si quieres que ejecute la conversión localmente — puedo generar el archivo Markdown ahora y darte el comando para convertirlo en tu máquina). También puedo generar versiones separadas (resumen para Product Owner, README corto, o un OpenAPI minimal para las APIs).

¿Quieres que cree además un PDF automático o que genere un OpenAPI/Swagger básico para las APIs?
