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
  Shield
} from 'lucide-react';

interface UserSession {
  userId: string;
  role: number;
  roleName: string;
  empresaId: number | null;
  email: string;
}

export default function DashboardAdmin() {
  const params = useParams();
  const router = useRouter();
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const empresaId = params.empresaId as string;

  useEffect(() => {
    checkAuthentication();
  }, []);

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

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth', { method: 'DELETE' });
      router.push('/auth/login');
    } catch (error) {
      console.error('Error cerrando sesión:', error);
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
                  Dashboard Administrador
                </h1>
                <p className="text-sm text-gray-600">
                  Empresa ID: {empresaId}
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
            Panel de Administración
          </h2>
          <p className="text-gray-600">
            Gestiona tu empresa y contenido desde aquí
          </p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Información de Empresa
              </CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Edita la información básica de tu empresa
              </p>
              <Button className="mt-3 w-full" variant="outline">
                Gestionar Empresa
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Productos y Servicios
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Administra tu catálogo de productos y servicios
              </p>
              <Button className="mt-3 w-full" variant="outline">
                Ver Catálogo
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Configuración
              </CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Personaliza tu sitio web y configuraciones
              </p>
              <Button className="mt-3 w-full" variant="outline">
                Configurar
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Estadísticas
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Ve el rendimiento de tu sitio web
              </p>
              <Button className="mt-3 w-full" variant="outline">
                Ver Estadísticas
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Status Info */}
        <Card>
          <CardHeader>
            <CardTitle>Estado del Sistema</CardTitle>
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
                <span className="text-sm font-medium">Empresa ID:</span>
                <span className="text-sm text-gray-600">{empresaId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Estado:</span>
                <span className="text-sm text-green-600">Activo</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Development Notice */}
        <Card className="mt-6 border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-yellow-800">
              <Settings className="h-5 w-5" />
              <strong>En Desarrollo</strong>
            </div>
            <p className="text-yellow-700 mt-2">
              Este dashboard está en desarrollo. Las funcionalidades se irán agregando progresivamente.
              Por ahora puedes verificar que el sistema de autenticación y roles funciona correctamente.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}