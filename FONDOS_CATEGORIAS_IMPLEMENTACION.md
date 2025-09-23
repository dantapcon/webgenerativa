# Implementación de Fondos Personalizados para Categorías

## Resumen Ejecutivo

Se ha implementado exitosamente una funcionalidad completa para permitir que cada categoría de productos/servicios tenga su propio color de fondo o imagen de fondo personalizada. Esta funcionalidad mejora significativamente la experiencia visual y permite mayor personalización por categoría.

## 🛠️ Cambios Realizados

### 1. Modificaciones en la Base de Datos

**Archivo**: `database_migrations/add_categoria_background_fields.sql`

Se agregaron tres nuevos campos a la tabla `categorias`:

```sql
ALTER TABLE public.categorias 
ADD COLUMN fondo_tipo character varying DEFAULT 'color' CHECK (fondo_tipo IN ('color', 'imagen')),
ADD COLUMN fondo_color character varying DEFAULT '#ffffff' CHECK (fondo_color ~* '^#[0-9A-Fa-f]{6}$'),
ADD COLUMN fondo_imagen text;
```

**Campos añadidos:**
- `fondo_tipo`: Especifica si usar color o imagen ('color' | 'imagen')
- `fondo_color`: Color de fondo en formato hexadecimal (#RRGGBB)
- `fondo_imagen`: URL de la imagen de fondo (opcional)

### 2. Actualización de Tipos TypeScript

**Archivo**: `lib/types/webgenerator.ts`

Se actualizó la interfaz `Categoria` para incluir los nuevos campos:

```typescript
export interface Categoria {
  id: number;
  empresa_id: number;
  nombre: string;
  descripcion?: string | null;
  tipo_display?: 'horizontal' | 'vertical' | null;
  orden: number;
  visible: boolean;
  fecha_creacion: string;
  fondo_tipo?: 'color' | 'imagen';        // ✅ NUEVO
  fondo_color?: string;                    // ✅ NUEVO
  fondo_imagen?: string | null;            // ✅ NUEVO
  subcategorias?: Subcategoria[];
}
```

### 3. APIs para Gestión de Fondos

#### Endpoint Individual: `/api/categorias/[categoriaId]/fondo`

**Archivo**: `app/api/categorias/[categoriaId]/fondo/route.ts`

- **GET**: Obtener configuración de fondo de una categoría específica
- **PUT**: Actualizar configuración de fondo completa
- **PATCH**: Actualización parcial de configuración de fondo

#### Endpoint Masivo: `/api/categorias/fondo`

**Archivo**: `app/api/categorias/fondo/route.ts`

- **GET**: Obtener todas las categorías con configuración de fondo
- **POST**: Actualizar configuración de fondo para múltiples categorías

**Características de las APIs:**
- ✅ Validación de datos de entrada
- ✅ Verificación de permisos por empresa
- ✅ Manejo completo de errores
- ✅ Soporte para operaciones masivas
- ✅ Estadísticas de configuración

### 4. Componente de Configuración

**Archivo**: `components/admin/CategoriaFondoManager.tsx`

Componente React completo para la gestión de fondos de categorías:

**Características principales:**
- ✅ Interfaz intuitiva con selector de tipo (color/imagen)
- ✅ Selector de color visual
- ✅ Input para URLs de imágenes
- ✅ Vista previa en tiempo real del fondo
- ✅ Guardado individual por categoría
- ✅ Guardado masivo de todas las configuraciones
- ✅ Manejo de estados de carga y errores
- ✅ Feedback visual con alertas

**Funcionalidades del componente:**
- Cambio dinámico entre tipo color e imagen
- Vista previa visual del fondo aplicado
- Validación de URLs y colores hexadecimales
- Guardado automático con confirmación
- Interface responsive y accesible

### 5. Integración en Panel de Administración

#### Nuevos Permisos

**Archivo**: `lib/constants/permisos.ts`

Se agregó una nueva sección de permisos:

```typescript
'fondos_categorias': {
  id: 'fondos_categorias',
  nombre: 'Fondos de Categorías',
  descripcion: 'Configurar colores e imágenes de fondo para cada categoría',
  icono: '🖼️',
  campos: ['fondo_tipo', 'fondo_color', 'fondo_imagen']
}
```

#### Dashboard de Administrador

**Archivo**: `app/dashboard-admin/[empresaId]/page.tsx`

- ✅ Agregado ícono para la nueva sección (Image de Lucide)
- ✅ Integración con sistema de permisos existente

#### Página de Edición

**Archivo**: `app/dashboard-admin/[empresaId]/editar/page.tsx`

- ✅ Nuevo caso en el switch para `fondos_categorias`
- ✅ Integración del componente `CategoriaFondoManager`
- ✅ Sistema de mensajes para feedback
- ✅ Verificación de permisos

### 6. Aplicación Visual en Frontend

**Archivo**: `app/[slug]/[categoria]/page.tsx`

Se modificó la página de categorías para aplicar fondos personalizados:

**Mejoras visuales:**
- ✅ Fondo dinámico basado en configuración de la categoría
- ✅ Soporte para imágenes de fondo con `background-attachment: fixed`
- ✅ Overlay automático para mejorar legibilidad con imágenes
- ✅ Headers adaptativos con backdrop-blur cuando hay imagen
- ✅ Colores de texto dinámicos según tipo de fondo

## 🎯 Funcionalidades Implementadas

### Para Administradores

1. **Configuración Individual por Categoría**
   - Seleccionar entre color sólido o imagen de fondo
   - Selector de color visual con input hexadecimal
   - Campo para URL de imagen de fondo
   - Vista previa en tiempo real

2. **Gestión Masiva**
   - Configurar múltiples categorías a la vez
   - Guardar todas las configuraciones simultáneamente
   - Estadísticas de configuración

3. **Sistema de Permisos**
   - Control granular de acceso a configuración de fondos
   - Integración con sistema de permisos existente

### Para Usuarios Finales

1. **Experiencia Visual Mejorada**
   - Cada categoría tiene su identidad visual única
   - Fondos personalizados que reflejan la temática
   - Mejor organización visual del contenido

2. **Responsive y Accesible**
   - Adaptación automática a diferentes dispositivos
   - Overlay para garantizar legibilidad del texto
   - Transiciones suaves y profesionales

## 📝 Instrucciones de Implementación

### Paso 1: Ejecutar Script de Base de Datos

```sql
-- Ejecutar en tu base de datos PostgreSQL/Supabase
-- Archivo: database_migrations/add_categoria_background_fields.sql
```

⚠️ **IMPORTANTE**: Debes ejecutar este script en tu base de datos antes de utilizar la funcionalidad.

### Paso 2: Asignar Permisos

1. Acceder al panel de administración de empresas
2. En la sección de administradores, asignar el permiso "Fondos de Categorías"
3. Los administradores con este permiso podrán configurar fondos

### Paso 3: Configurar Fondos

1. Los administradores pueden acceder desde Dashboard → Fondos de Categorías
2. Seleccionar tipo de fondo (color/imagen) para cada categoría
3. Configurar colores o URLs de imágenes
4. Vista previa en tiempo real
5. Guardar configuraciones

## 🔧 Validaciones Implementadas

### Backend
- ✅ Formato hexadecimal válido para colores (#RRGGBB)
- ✅ Tipo de fondo limitado a 'color' | 'imagen'
- ✅ Verificación de pertenencia de categoría a empresa
- ✅ Validación de permisos de administrador

### Frontend
- ✅ Validación en tiempo real de colores
- ✅ Verificación de URLs de imágenes
- ✅ Estados de carga y error
- ✅ Feedback visual inmediato

## 🎨 Características Visuales

### Vista Previa en Tiempo Real
- Muestra exactamente cómo se verá la categoría
- Overlay con nombre de la categoría
- Cambios instantáneos al modificar configuración

### Aplicación en Sitio Web
- Fondo de página completo con la configuración
- Imagen fija que permanece al hacer scroll
- Headers adaptivos con backdrop-blur
- Overlay automático para mejorar contraste

## 🛡️ Seguridad y Permisos

### Control de Acceso
- Solo administradores con permisos específicos
- Verificación por empresa
- Validación de datos en backend

### Validaciones de Seguridad
- Sanitización de URLs de imágenes
- Validación estricta de formatos de color
- Prevención de inyección de código

## 🚀 Beneficios de la Implementación

1. **Mayor Personalización**: Cada categoría puede tener su identidad visual única
2. **Experiencia de Usuario Mejorada**: Navegación más intuitiva y atractiva
3. **Flexibilidad**: Soporte tanto para colores como imágenes
4. **Escalabilidad**: Sistema de permisos permite control granular
5. **Mantenibilidad**: Código modular y bien documentado

## 📋 Archivos Modificados/Creados

### Nuevos Archivos
- `database_migrations/add_categoria_background_fields.sql`
- `app/api/categorias/[categoriaId]/fondo/route.ts`
- `app/api/categorias/fondo/route.ts`
- `components/admin/CategoriaFondoManager.tsx`

### Archivos Modificados
- `lib/types/webgenerator.ts`
- `lib/constants/permisos.ts`
- `app/dashboard-admin/[empresaId]/page.tsx`
- `app/dashboard-admin/[empresaId]/editar/page.tsx`
- `app/[slug]/[categoria]/page.tsx`

## ✅ Testing Recomendado

1. **Verificar script de base de datos** en entorno de desarrollo
2. **Probar configuración de fondos** para diferentes categorías
3. **Validar visualización** en páginas de categorías
4. **Verificar permisos** para diferentes tipos de administradores
5. **Probar responsividad** en diferentes dispositivos

---

¡La implementación está completa y lista para usar! 🎉