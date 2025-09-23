'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Building, 
  Users, 
  Settings, 
  BarChart3, 
  LogOut,
  Shield,
  Phone,
  Palette,
  ExternalLink,
  MapPin,
  FolderOpen,
  Lock,
  CheckCircle,
  Image
} from 'lucide-react';
import { SECCIONES_EDITABLES } from '@/lib/constants/permisos';

interface UserSession {
  userId: string;
  role: number;
  roleName: string;
  empresaId: number | null;
  email: string;
}

interface PermisoAdmin {
  id_permi: string;
  nombre_permi: string;
  descripcion_per: string;
  id_empresa: number;
  id_rol: string;
}

interface Empresa {
  id: number;
  nombre_empresa: string;
  descripcion_empresa?: string;
  slug_empresa: string;
}

export default function DashboardAdmin() {
  const params = useParams();
  const router = useRouter();
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permisos, setPermisos] = useState<PermisoAdmin[]>([]);
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [loadingPermisos, setLoadingPermisos] = useState(false);
  const [adminInfo, setAdminInfo] = useState<any>(null); // Info del admin desde la tabla administradores

  const empresaId = params.empresaId as string;

  useEffect(() => {
    checkAuthentication();
  }, []);

  useEffect(() => {
    if (userSession) {
      cargarAdminInfo();
      cargarEmpresa();
    }
  }, [userSession]);

  useEffect(() => {
    if (adminInfo) {
      cargarPermisos();
    }
  }, [adminInfo]);

  const checkAuthentication = async () => {
    try {
      const response = await fetch('/api/admin/auth');
      const result = await response.json();

      if (!result.success) {
        router.push('/auth/login');
        return;
      }

      const user = result.user as UserSession;

      // Verificar que sea administrador y tenga acceso a esta empresa
      if (user.role !== 2 && user.role !== 1) {
        setError('No tienes permisos de administrador');
        return;
      }

      // Si es administrador (no superadmin), verificar que pertenezca a esta empresa
      if (user.role === 2 && user.empresaId !== parseInt(empresaId)) {
        setError('No tienes acceso a esta empresa');
        return;
      }

      setUserSession(user);
    } catch (error) {
      console.error('Error verificando autenticación:', error);
      router.push('/auth/login');
    } finally {
      setLoading(false);
    }
  };

  const cargarAdminInfo = async () => {
    if (!userSession?.userId) return;
    
    try {
      const response = await fetch(`/api/admin/get-admin?empresa_id=${empresaId}`);
      const result = await response.json();
      
      if (result.success && result.data) {
        setAdminInfo(result.data);
      } else {
        console.error('No se encontró información del administrador');
      }
    } catch (error) {
      console.error('Error cargando información del admin:', error);
    }
  };

  const cargarPermisos = async () => {
    if (!adminInfo?.id) return;
    
    setLoadingPermisos(true);
    try {
      const response = await fetch(`/api/admin/permisos?admin_id=${adminInfo.id}&empresa_id=${empresaId}`);
      const result = await response.json();
      
      if (result.success) {
        setPermisos(result.data.permisos_activos || []);
      } else {
        console.error('Error cargando permisos:', result.error);
      }
    } catch (error) {
      console.error('Error cargando permisos:', error);
    } finally {
      setLoadingPermisos(false);
    }
  };

  const cargarEmpresa = async () => {
    try {
      const response = await fetch(`/api/empresas/${empresaId}`);
      const result = await response.json();
      
      if (result.success) {
        setEmpresa(result.data);
      }
    } catch (error) {
      console.error('Error cargando empresa:', error);
    }
  };

  const tienePermiso = (seccionId: string): boolean => {
    return permisos.some(p => p.nombre_permi === seccionId);
  };

  const getSeccionIcon = (seccionId: string) => {
    const iconMap: Record<string, any> = {
      'info_basica': Building,
      'info_contacto': Phone,
      'personalizacion_visual': Palette,
      'configuracion_adicional': Settings,
      'ventana_flotante': ExternalLink,
      'sucursales': MapPin,
      'categorias': FolderOpen,
      'fondos_categorias': Image
    };
    return iconMap[seccionId] || Settings;
  };

  const handleEditarSeccion = (seccionId: string) => {
    // Navegar a la página de edición específica para administradores
    router.push(`/dashboard-admin/${empresaId}/editar?seccion=${seccionId}`);
  };

  const handleLogout = async () => {
    try {
      // 1. Llamar al endpoint de logout
      await fetch('/api/admin/auth', { method: 'DELETE' });
      
      // 2. Limpiar cualquier storage local
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
      }
      
      // 3. Forzar recarga completa para limpiar estado
      window.location.href = '/auth/login';
    } catch (error) {
      console.error('Error cerrando sesión:', error);
      // En caso de error, forzar limpieza local y redirección
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/auth/login';
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Cargando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-lg mb-4">{error}</div>
          <Button onClick={() => router.push('/auth/login')}>
            Ir al login
          </Button>
        </div>
      </div>
    );
  }

  const seccionesPermitidas = Object.values(SECCIONES_EDITABLES).filter(seccion => 
    tienePermiso(seccion.id)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Panel de Administración
                </h1>
                <p className="text-sm text-gray-600">
                  {empresa?.nombre_empresa || `Empresa ${empresaId}`}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                {userSession?.email} ({userSession?.roleName})
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Secciones Disponibles
          </h2>
          <p className="text-gray-600">
            Puedes editar las siguientes secciones de tu empresa
          </p>
        </div>

        {loadingPermisos ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : seccionesPermitidas.length === 0 ? (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-orange-800">
                <Lock className="h-5 w-5" />
                <strong>Sin Permisos Asignados</strong>
              </div>
              <p className="text-orange-700 mt-2">
                No tienes permisos para editar ninguna sección. Contacta al superadministrador para que te asigne los permisos correspondientes.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Dashboard Cards - Solo secciones permitidas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {seccionesPermitidas.map((seccion) => {
                const IconComponent = getSeccionIcon(seccion.id);
                
                return (
                  <Card key={seccion.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        {seccion.nombre}
                      </CardTitle>
                      <IconComponent className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted-foreground mb-3">
                        {seccion.descripcion}
                      </p>
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        <span className="text-xs text-green-600">Permiso concedido</span>
                      </div>
                      <Button 
                        className="w-full" 
                        variant="outline"
                        onClick={() => handleEditarSeccion(seccion.id)}
                      >
                        Editar {seccion.nombre}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Status Info */}
            <Card>
              <CardHeader>
                <CardTitle>Información del Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Rol de Usuario:</span>
                    <span className="text-sm text-gray-600">{userSession?.roleName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Email:</span>
                    <span className="text-sm text-gray-600">{userSession?.email}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Empresa:</span>
                    <span className="text-sm text-gray-600">{empresa?.nombre_empresa}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Permisos Activos:</span>
                    <span className="text-sm text-blue-600">{permisos.length} secciones</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Estado:</span>
                    <span className="text-sm text-green-600">Activo</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}