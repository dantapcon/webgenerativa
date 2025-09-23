'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Building, 
  Users, 
  BarChart3, 
  Globe, 
  Shield, 
  Plus,
  ExternalLink,
  Settings,
  LogOut,
  Eye,
  TrendingUp,
  Calendar,
  Activity
} from 'lucide-react';
import Link from 'next/link';

interface UserSession {
  userId: string;
  role: number;
  roleName: string;
  empresaId: number | null;
  email: string;
}

interface DashboardStats {
  totalEmpresas: number;
  empresasActivas: number;
  totalAdministradores: number;
  sitiosPublicados: number;
}

export default function SuperAdminDashboard() {
  const router = useRouter();
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuthentication();
  }, []);

  useEffect(() => {
    if (userSession && userSession.role === 1) {
      loadDashboardStats();
    }
  }, [userSession]);

  const checkAuthentication = async () => {
    try {
      const response = await fetch('/api/admin/auth');
      const result = await response.json();

      if (!result.success) {
        router.push('/auth/login');
        return;
      }

      const user = result.user as UserSession;

      // Verificar que sea superadministrador
      if (user.role !== 1) {
        router.push('/auth/login');
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

  const loadDashboardStats = async () => {
    try {
      // Aquí podrías cargar estadísticas reales del dashboard
      // Por ahora uso datos mock, pero puedes crear un endpoint específico
      setStats({
        totalEmpresas: 0,
        empresasActivas: 0,
        totalAdministradores: 0,
        sitiosPublicados: 0
      });
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
      setError('Error al cargar estadísticas del dashboard');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/auth/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <div className="text-lg text-gray-600">Cargando Dashboard...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Alert className="max-w-md border-red-200 bg-red-50">
          <Shield className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
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
                  Dashboard Superadministrador
                </h1>
                <p className="text-sm text-gray-600">WebGenerator Pro</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                {userSession?.email}
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
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
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            ¡Bienvenido, Superadministrador!
          </h2>
          <p className="text-gray-600">
            Gestiona empresas, administradores y supervisa todo el sistema WebGenerator Pro.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-blue-200 bg-blue-50 hover:shadow-lg transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-blue-800 mb-1">Crear Empresa</h3>
                  <p className="text-xs text-blue-600">Nuevo sitio web</p>
                </div>
                <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <Link href="/generador" className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Crear
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50 hover:shadow-lg transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-green-800 mb-1">Gestionar Empresas</h3>
                  <p className="text-xs text-green-600">Ver todas las empresas</p>
                </div>
                <Button asChild size="sm" variant="outline" className="border-green-600 text-green-700 hover:bg-green-100">
                  <Link href="/admin/empresas" className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Ver
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50 hover:shadow-lg transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-purple-800 mb-1">Estadísticas</h3>
                  <p className="text-xs text-purple-600">Métricas del sistema</p>
                </div>
                <Button asChild size="sm" variant="outline" className="border-purple-600 text-purple-700 hover:bg-purple-100">
                  <Link href="/admin/estadisticas" className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Ver
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50 hover:shadow-lg transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-orange-800 mb-1">Configuración</h3>
                  <p className="text-xs text-orange-600">Ajustes del sistema</p>
                </div>
                <Button asChild size="sm" variant="outline" className="border-orange-600 text-orange-700 hover:bg-orange-100">
                  <Link href="/admin/configuracion" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Ajustar
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Empresas</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalEmpresas}</div>
                <p className="text-xs text-muted-foreground">
                  Empresas registradas en el sistema
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sitios Activos</CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.empresasActivas}</div>
                <p className="text-xs text-muted-foreground">
                  Sitios web publicados
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Administradores</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalAdministradores}</div>
                <p className="text-xs text-muted-foreground">
                  Usuarios administradores
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sitios Publicados</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.sitiosPublicados}</div>
                <p className="text-xs text-muted-foreground">
                  En los últimos 30 días
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recent Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Acciones Rápidas
              </CardTitle>
              <CardDescription>
                Operaciones frecuentes del sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button asChild className="w-full justify-start">
                <Link href="/generador" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Crear Nueva Empresa
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/admin/empresas" className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Administrar Todas las Empresas
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/admin/estadisticas" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Ver Estadísticas Detalladas
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Información del Sistema
              </CardTitle>
              <CardDescription>
                Estado actual del sistema WebGenerator Pro
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Estado del Sistema:</span>
                <span className="flex items-center gap-2 text-sm font-medium text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Operativo
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Última Actualización:</span>
                <span className="text-sm text-gray-800">
                  {new Date().toLocaleDateString('es-ES')}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Versión:</span>
                <span className="text-sm text-gray-800">WebGenerator Pro v2.0</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}