# Sistema de Generación de Páginas Web Oftalmológicas

Sistema completo desarrollado para generar páginas web profesionales para clínicas oftalmológicas, replicando exactamente el proyecto original de Flask a Next.js con Supabase.

## 🏗️ Arquitectura del Proyecto

```
webgenerativa/
├── app/
│   ├── oftalmologia/           # Formulario principal de creación
│   │   └── page.tsx
│   ├── admin/
│   │   └── clinicas/          # Panel de administración
│   │       └── page.tsx
│   ├── clinicas/
│   │   └── [id]/              # Páginas generadas dinámicamente
│   │       └── page.tsx
│   └── api/
│       └── clinicas/          # APIs REST
│           ├── route.ts       # CRUD general
│           └── [id]/
│               └── route.ts   # CRUD específico por ID
├── lib/
│   ├── types/
│   │   └── oftalmologia.ts    # Tipos TypeScript
│   └── services/
│       └── oftalmologia.ts    # Servicios de base de datos
├── supabase_schema.sql        # Esquema de base de datos
└── test_oftalmologia_api.js   # Script de pruebas
```

## 🚀 Características

- **✅ Formulario de Administrador**: Interfaz intuitiva para crear páginas web
- **✅ Base de Datos Supabase**: Almacenamiento en la nube con PostgreSQL
- **✅ Páginas Dinámicas**: Generación automática de sitios web oftalmológicos
- **✅ Diseño Responsivo**: Compatible con dispositivos móviles
- **✅ API REST**: Endpoints completos para todas las operaciones
- **✅ Personalización de Estilos**: Colores, fuentes y temas customizables
- **✅ Vista Previa en Tiempo Real**: Previsualización de cambios de estilo
- **✅ Panel de Administración**: Gestión completa de clínicas creadas

## 🛠️ Tecnologías Utilizadas

### Frontend
- **Next.js 14**: Framework React con App Router
- **TypeScript**: Tipado estático
- **Tailwind CSS**: Framework CSS
- **shadcn/ui**: Componentes de UI
- **Lucide React**: Iconografía
- **date-fns**: Manejo de fechas

### Backend
- **Next.js API Routes**: APIs serverless
- **Supabase**: Base de datos PostgreSQL
- **Row Level Security**: Políticas de seguridad

### Base de Datos
- **PostgreSQL**: Base de datos principal via Supabase
- **UUID**: Identificadores únicos
- **Triggers**: Actualización automática de timestamps

## 🗄️ Estructura de Base de Datos

### Tabla `clinicas_oftalmologicas`
- `id`: UUID (Primary Key)
- `titulo`: Título de la clínica (requerido)
- `lema`: Lema o slogan
- `logo_url`: URL del logo
- `quienes_somos`: Descripción de la clínica (requerido)
- `mision`: Misión de la clínica (requerido)
- `vision`: Visión de la clínica (requerido)
- `telefono`: Teléfono de contacto
- `email`: Email de contacto
- `direccion`: Dirección física
- `activo`: Estado activo/inactivo
- `created_at`: Fecha de creación
- `updated_at`: Fecha de actualización

### Tabla `estilos_clinicas`
- `id`: UUID (Primary Key)
- `clinica_id`: Referencia a clínica (Foreign Key)
- `color_primario`: Color principal (#2c5aa0)
- `color_secundario`: Color secundario (#1e3a8a)
- `color_acento`: Color de acento (#3b82f6)
- `color_texto`: Color del texto (#1f2937)
- `color_fondo`: Color de fondo (#ffffff)
- `fuente_principal`: Fuente principal (Poppins)
- `fuente_titulo`: Fuente de títulos (Poppins)
- `tamano_fuente`: Tamaño de fuente (16px)
- `estilo_botones`: Estilo de botones (rounded/square/pill)
- `tema_general`: Tema general (moderno/clasico/minimalista/corporativo)

## 📋 Configuración e Instalación

### 1. Configurar Base de Datos en Supabase

```sql
-- Ejecutar el contenido del archivo supabase_schema.sql
-- en el SQL Editor de Supabase
```

### 2. Variables de Entorno

Asegúrate de que tu archivo `.env.local` contenga:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=tu_supabase_anon_key
```

### 3. Instalar Dependencias

```bash
npm install @supabase/supabase-js date-fns lucide-react
```

### 4. Ejecutar el Proyecto

```bash
npm run dev
```

## 🗄️ API Endpoints

### Clínicas
- `GET /api/clinicas` - Obtener todas las clínicas
- `GET /api/clinicas?active=true` - Obtener solo clínicas activas
- `POST /api/clinicas` - Crear nueva clínica
- `GET /api/clinicas/{id}` - Obtener clínica por ID
- `PUT /api/clinicas/{id}` - Actualizar clínica
- `PATCH /api/clinicas/{id}` - Cambiar estado activo/inactivo
- `DELETE /api/clinicas/{id}` - Desactivar clínica

### Páginas Web
- `GET /clinicas/{id}` - Ver página web generada
- `GET /admin/clinicas` - Panel de administración
- `GET /oftalmologia` - Formulario de creación

## 📖 Guía de Uso

### Crear una Nueva Clínica

1. **Acceder al Formulario**
   - Ir a `/oftalmologia`
   - Completar los campos del formulario

2. **Información Básica**
   - Título de la clínica (obligatorio)
   - Datos de contacto (opcional)
   - Logo (opcional)

3. **Información Institucional**
   - "Quiénes Somos" (obligatorio)
   - Misión (obligatorio)
   - Visión (obligatorio)

4. **Personalización de Estilos**
   - Colores personalizados
   - Fuentes y tamaños
   - Estilos de botones
   - Vista previa en tiempo real

5. **Generar Página**
   - Hacer clic en "Generar Página Web"
   - La página se crea automáticamente
   - Acceso directo a la URL generada

### Administrar Clínicas

1. **Panel de Administración**
   - Ir a `/admin/clinicas`
   - Ver todas las clínicas creadas
   - Estadísticas en tiempo real

2. **Acciones Disponibles**
   - Ver página generada
   - Ver detalles completos
   - Activar/Desactivar clínica
   - Eliminar (desactivar) clínica

### Páginas Generadas

- Cada clínica tiene su propia URL: `/clinicas/{id}`
- Las páginas incluyen:
  - Header con logo y datos de contacto
  - Navegación sticky
  - Sección hero
  - Sección "Quiénes Somos"
  - Misión y Visión
  - Footer con información completa
  - Diseño responsivo y profesional
  - Estilos completamente personalizados

## 🧪 Pruebas

### Script de Prueba Automático

```bash
node test_oftalmologia_api.js
```

Este script prueba:
- ✅ Creación de clínicas
- ✅ Obtención de datos
- ✅ Lista de clínicas
- ✅ Cambio de estados
- ✅ Generación de URLs

### Datos de Ejemplo

El script incluye datos de ejemplo completos para crear una clínica de prueba con:
- Información completa de contacto
- Textos institucionales profesionales
- Estilos personalizados
- Configuración completa

## 🎨 Personalización

### Colores y Estilos
Los colores se configuran dinámicamente usando CSS Variables:
```css
:root {
    --primary-color: #2c5aa0;
    --secondary-color: #1e3a8a;
    --accent-color: #3b82f6;
}
```

### Fuentes Disponibles
- Poppins
- Roboto
- Open Sans
- Lato
- Montserrat
- Inter

### Estilos de Botones
- **Rounded**: Bordes redondeados (25px)
- **Square**: Bordes cuadrados (4px)
- **Pill**: Bordes completamente redondeados (50px)

### Temas Generales
- **Moderno**: Diseño actual y limpio
- **Clásico**: Estilo tradicional
- **Minimalista**: Diseño simple y elegante
- **Corporativo**: Apariencia empresarial

## 🔧 Desarrollo

### Agregar Nuevas Funcionalidades

1. **Backend**: Agregar rutas en `/api/clinicas/`
2. **Frontend**: Modificar componentes en `/app/`
3. **Tipos**: Actualizar `/lib/types/oftalmologia.ts`
4. **Servicios**: Extender `/lib/services/oftalmologia.ts`

### Estructura de Servicios

```typescript
// Servicios disponibles
OftalmologiaService.createClinica(data)
OftalmologiaService.getAllClinicas()
OftalmologiaService.getActiveClinicas()
OftalmologiaService.getClinicaById(id)
OftalmologiaService.updateClinica(id, data)
OftalmologiaService.toggleClinicaStatus(id)
OftalmologiaService.deleteClinica(id)
```

## 🚨 Solución de Problemas

### Error de Conexión a Supabase
```bash
# Verificar variables de entorno
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY
```

### Base de Datos No Se Encuentra
- Ejecutar el script `supabase_schema.sql` en Supabase
- Verificar que las tablas se crearon correctamente
- Revisar las políticas RLS

### Páginas No Se Generan
- Verificar que la clínica esté activa (`activo = true`)
- Comprobar que el ID existe en la base de datos
- Revisar logs del servidor en la consola

## 📊 Características Técnicas

- **Rendimiento**: Páginas estáticas generadas dinámicamente
- **SEO**: Meta tags y estructura semántica
- **Accesibilidad**: ARIA labels y navegación por teclado
- **Seguridad**: Row Level Security en Supabase
- **Escalabilidad**: Arquitectura serverless
- **Mantenibilidad**: Código TypeScript tipado

## 🎯 Próximas Mejoras Sugeridas

- [ ] Sistema de autenticación completo
- [ ] Editor WYSIWYG para contenido
- [ ] Múltiples templates de diseño
- [ ] Galería de imágenes
- [ ] Sistema de citas online
- [ ] Integración con redes sociales
- [ ] SEO automático avanzado
- [ ] Exportación a PDF
- [ ] Analytics integrado
- [ ] Backup automático

## 👨‍💻 Desarrollado

Sistema replicado exactamente del proyecto original Flask/Python a Next.js/TypeScript con Supabase, manteniendo toda la funcionalidad y mejorando la arquitectura con tecnologías modernas.

---

**✅ Todo funciona exactamente igual al proyecto original pero con mejor rendimiento, escalabilidad y mantenibilidad.**
