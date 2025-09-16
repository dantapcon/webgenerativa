# Sistema de Administración de Páginas - WebGenerator Pro

## 📋 Resumen del Sistema

Este sistema permite a los **superadministradores** asignar acceso de edición granular a cada página de empresa generada, facilitando que los clientes puedan editar sus propias páginas con permisos específicos.

## 🏗️ Arquitectura Implementada

### Base de Datos

#### Tabla: `admin_paginas`
- **Propósito**: Almacena los administradores de cada empresa
- **Campos principales**:
  - `id` (UUID): Identificador único del administrador
  - `empresa_id` (INTEGER): Referencia a la empresa administrada
  - `email` (VARCHAR): Email de acceso único globalmente
  - `password_hash` (TEXT): Contraseña hasheada
  - `nombre` (VARCHAR): Nombre completo del administrador
  - `activo` (BOOLEAN): Si el administrador está activo
  - `login_habilitado` (BOOLEAN): Si puede iniciar sesión

#### Tabla: `permisos_admin_empresas`
- **Propósito**: Define qué elementos puede editar cada administrador
- **Permisos disponibles**:
  - `puede_editar_info_basica`: Nombre, descripción, teléfono, email
  - `puede_editar_contacto`: Dirección, ubicación, horarios
  - `puede_editar_modal`: Contenido del modal de consejos/promociones
  - `puede_editar_categorias`: Gestión de categorías de productos/servicios
  - `puede_editar_sucursales`: Múltiples ubicaciones
  - `puede_editar_contenido_hero`: Título, descripción e imagen principal
  - `puede_editar_videos`: Videos promocionales

### APIs Implementadas

#### `/api/admin/empresas`
- **POST**: Crear administrador para empresa
- **GET**: Obtener administrador por empresa_id o admin_id
- **PUT**: Actualizar administrador existente

#### `/api/admin/auth`
- **POST**: Iniciar sesión de administrador
- **GET**: Verificar si login está habilitado para empresa
- **PATCH**: Habilitar/deshabilitar login para empresa

### Componentes de Frontend

#### `LoginEmpresa.tsx`
- Botón flotante "Iniciar Sesión" en páginas de empresa
- Modal de autenticación con email/contraseña
- Panel de administrador después del login
- Se muestra solo si `login_habilitado = true`

#### `AdminEmpresasManager.tsx`
- Panel de gestión para superadministradores
- Crear/editar administradores
- Configurar permisos granulares
- Habilitar/deshabilitar login por empresa

## 🚀 Instalación y Configuración

### 1. Ejecutar Migración de Base de Datos

```sql
-- Ejecutar en tu consola SQL de Supabase:
-- Archivo: sql_migrations/add_admin_pages_system_FINAL.sql
```

### 2. Instalar Dependencias (si no están instaladas)

```bash
npm install bcryptjs @types/bcryptjs
```

### 3. Integrar en Páginas de Empresa

En tu página de empresa (ej: `app/[slug]/page.tsx`):

```tsx
import LoginEmpresa from '@/components/admin/LoginEmpresa';

export default function EmpresaPage({ params }: { params: { slug: string } }) {
  // ... tu código existente para obtener empresa
  
  return (
    <div>
      {/* Tu contenido de empresa existente */}
      
      {/* Agregar botón de login admin */}
      <LoginEmpresa 
        empresaId={empresa.id} 
        empresaNombre={empresa.nombre_empresa} 
      />
    </div>
  );
}
```

### 4. Panel de Superadministrador

En tu panel admin (ej: `app/admin/empresas/page.tsx`):

```tsx
import AdminEmpresasManager from '@/components/admin/AdminEmpresasManager';

export default function AdminEmpresasPage() {
  // Obtener lista de empresas
  const empresas = await getEmpresas();
  
  return (
    <div>
      <AdminEmpresasManager empresas={empresas} />
    </div>
  );
}
```

## 📖 Guía de Uso

### Para Superadministradores

1. **Crear Administrador de Empresa**:
   - Ir al panel de administración
   - Seleccionar empresa
   - Crear email/contraseña para el cliente
   - Configurar permisos específicos
   - Habilitar login

2. **Gestionar Permisos**:
   - Editar administrador existente
   - Marcar/desmarcar permisos granulares
   - Habilitar/deshabilitar login temporalmente

### Para Administradores de Empresa

1. **Acceder a su Página**:
   - Ir a la URL de su empresa
   - Hacer clic en "Iniciar Sesión" (esquina superior derecha)
   - Ingresar email y contraseña proporcionados

2. **Editar Contenido**:
   - Solo verán opciones de edición según sus permisos
   - Interface intuitiva con permisos granulares
   - Cambios se guardan automáticamente

## 🔧 Personalización Avanzada

### Agregar Nuevos Permisos

1. **Base de Datos**:
```sql
ALTER TABLE permisos_admin_empresas 
ADD COLUMN puede_editar_nuevo_elemento BOOLEAN DEFAULT false;
```

2. **TypeScript**:
```typescript
export interface PermisosAdminEmpresa {
  // ... permisos existentes
  puede_editar_nuevo_elemento: boolean;
}
```

3. **Constante de Descripción**:
```typescript
export const PERMISOS_DESCRIPCION = {
  // ... descripciones existentes
  puede_editar_nuevo_elemento: 'Descripción del nuevo permiso'
};
```

### Integrar con Sistema de Edición

Para integrar el sistema con tu interfaz de edición existente:

```tsx
// Hook personalizado para verificar permisos
const useAdminPermisos = (empresaId: number) => {
  const [admin, setAdmin] = useState<AdminEmpresaCompleto | null>(null);
  
  useEffect(() => {
    // Verificar si hay admin logueado
    const token = sessionStorage.getItem('admin_token');
    const storedEmpresaId = sessionStorage.getItem('admin_empresa_id');
    
    if (token && storedEmpresaId === empresaId.toString()) {
      // Validar token y obtener permisos
      fetchAdminData(token);
    }
  }, [empresaId]);
  
  const canEdit = (permiso: keyof PermisosAdminEmpresa) => {
    return admin?.permisos?.[permiso] || false;
  };
  
  return { admin, canEdit, isAuthenticated: !!admin };
};

// Usar en componentes
const { canEdit } = useAdminPermisos(empresaId);

{canEdit('puede_editar_info_basica') && (
  <EditButton onClick={editarInfoBasica} />
)}
```

## 🔒 Consideraciones de Seguridad

### Para Producción

1. **Contraseñas**: Cambiar de `btoa()` a `bcryptjs` en el servicio
2. **Tokens**: Implementar JWT con httpOnly cookies
3. **Validación**: Agregar validación del lado servidor en todas las APIs
4. **RLS**: Las políticas de Supabase ya están configuradas
5. **Rate Limiting**: Implementar límites en intentos de login

### Mejoras Recomendadas

- [ ] Implementar bcryptjs en lugar de btoa() para producción
- [ ] Agregar sistema de recuperación de contraseña
- [ ] Implementar JWT tokens seguros
- [ ] Agregar logs de auditoría para cambios
- [ ] Crear sistema de notificaciones por email
- [ ] Implementar sesiones con expiración automática

## 📞 Soporte

Sistema desarrollado para WebGenerator Pro. Para soporte técnico o personalizaciones adicionales, contactar al equipo de desarrollo.

---

**Estado**: ✅ Implementación Completa - Listo para Integración
**Versión**: 1.0.0
**Fecha**: Enero 2025
