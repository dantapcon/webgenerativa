'use client';

import { useState, useEffect } from 'react';
import { Empresa } from '@/lib/types/webgenerator';
import { WebGeneratorService } from '@/lib/services/webgenerator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import AdminEmpresasManager from '@/components/admin/AdminEmpresasManager';
import { 
  Building, 
  Globe, 
  Eye, 
  Edit, 
  Trash2, 
  Power, 
  Search, 
  Plus, 
  ExternalLink,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Palette,
  Settings,
  BarChart3,
  Users,
  Shield,
  LogOut
} from 'lucide-react';
import Link from 'next/link';

interface EmpresaConEstado extends Empresa {
  estado_color: string;
  estado_texto: string;
}

export default function AdminEmpresasPage() {
  const [empresas, setEmpresas] = useState<EmpresaConEstado[]>([]);
  const [filteredEmpresas, setFilteredEmpresas] = useState<EmpresaConEstado[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState<string>('todos');
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'empresas' | 'administradores'>('empresas');

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const getEstadoInfo = (estado: string) => {
    switch (estado) {
      case 'publicado':
        return { color: 'bg-green-100 text-green-800 border-green-200', texto: 'Publicado' };
      case 'creando':
        return { color: 'bg-blue-100 text-blue-800 border-blue-200', texto: 'Creando' };
      case 'error':
        return { color: 'bg-red-100 text-red-800 border-red-200', texto: 'Error' };
      case 'mantenimiento':
        return { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', texto: 'Mantenimiento' };
      default:
        return { color: 'bg-gray-100 text-gray-800 border-gray-200', texto: 'Desconocido' };
    }
  };

  const cargarEmpresas = async () => {
    setIsLoading(true);
    try {
      const data = await WebGeneratorService.getAllEmpresas();
      const empresasConEstado = data.map(empresa => {
        const estadoInfo = getEstadoInfo(empresa.estado_sitio);
        return {
          ...empresa,
          estado_color: estadoInfo.color,
          estado_texto: estadoInfo.texto
        };
      });
      setEmpresas(empresasConEstado);
      setFilteredEmpresas(empresasConEstado);
    } catch (error) {
      console.error('Error cargando empresas:', error);
      showAlert('error', 'Error al cargar las empresas');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleEstadoEmpresa = async (id: number) => {
    try {
      await WebGeneratorService.toggleEmpresaStatus(id);
      showAlert('success', 'Estado de la empresa actualizado');
      cargarEmpresas();
    } catch (error) {
      console.error('Error cambiando estado:', error);
      showAlert('error', 'Error al cambiar el estado de la empresa');
    }
  };

  const eliminarEmpresa = async (id: number, nombre: string) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar "${nombre}"?`)) {
      try {
        await WebGeneratorService.deleteEmpresa(id);
        showAlert('success', 'Empresa eliminada exitosamente');
        cargarEmpresas();
      } catch (error) {
        console.error('Error eliminando empresa:', error);
        showAlert('error', 'Error al eliminar la empresa');
      }
    }
  };

  // Filtrar empresas
  useEffect(() => {
    let filtered = empresas;

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(empresa => 
        empresa.nombre_empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
        empresa.tipo_negocio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        empresa.correo_empresa?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por estado
    if (filterEstado !== 'todos') {
      filtered = filtered.filter(empresa => empresa.estado_sitio === filterEstado);
    }

    setFilteredEmpresas(filtered);
  }, [searchTerm, filterEstado, empresas]);

  useEffect(() => {
    cargarEmpresas();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth', { method: 'DELETE' });
      window.location.href = '/auth/login';
    } catch (error) {
      console.error('Error cerrando sesión:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando empresas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Building className="h-8 w-8 text-blue-600" />
              Administrar Sitios Web
            </h1>
            <p className="text-gray-600 mt-2">
              Gestiona todas las páginas web creadas con WebGenerator Pro
            </p>
          </div>
          <div className="flex flex-col md:flex-row gap-4">
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link href="/generador" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Crear Nuevo Sitio
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/estadisticas" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Ver Estadísticas
              </Link>
            </Button>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Cerrar Sesión
            </Button>
          </div>
        </div>

        {/* Pestañas de navegación */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('empresas')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'empresas'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Empresas
              </div>
            </button>
            <button
              onClick={() => setActiveTab('administradores')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'administradores'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Administradores
              </div>
            </button>
          </nav>
        </div>

        {alert && (
          <Alert className={`${alert.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} mb-6`}>
            <AlertDescription className={alert.type === 'success' ? 'text-green-800' : 'text-red-800'}>
              {alert.message}
            </AlertDescription>
          </Alert>
        )}

        {/* Contenido de las pestañas */}
        {activeTab === 'empresas' ? (
          <>
            {/* Controles de filtros */}
            <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar por nombre, tipo o email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <select
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="todos">Todos los estados</option>
                <option value="publicado">Publicado</option>
                <option value="creando">Creando</option>
                <option value="mantenimiento">Mantenimiento</option>
                <option value="error">Error</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Globe className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{empresas.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Eye className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Publicados</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {empresas.filter(e => e.estado_sitio === 'publicado').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Settings className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Mantenimiento</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {empresas.filter(e => e.estado_sitio === 'mantenimiento').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Con Error</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {empresas.filter(e => e.estado_sitio === 'error').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de empresas */}
        {filteredEmpresas.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No se encontraron empresas
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || filterEstado !== 'todos' 
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'Comienza creando tu primer sitio web'
                }
              </p>
              <Button asChild>
                <Link href="/generador">
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Primer Sitio
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredEmpresas.map((empresa) => (
              <Card key={empresa.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Información principal */}
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        {empresa.logo_url && (
                          <img 
                            src={empresa.logo_url} 
                            alt={`Logo de ${empresa.nombre_empresa}`}
                            className="w-12 h-12 object-contain bg-gray-100 rounded-lg p-1"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-semibold text-gray-900">
                              {empresa.nombre_empresa}
                            </h3>
                            <Badge className={empresa.estado_color}>
                              {empresa.estado_texto}
                            </Badge>
                            {empresa.tipo_negocio && (
                              <Badge variant="outline">
                                {empresa.tipo_negocio}
                              </Badge>
                            )}
                          </div>
                          
                          {empresa.descripcion_empresa && (
                            <p className="text-gray-600 mb-3 line-clamp-2">
                              {empresa.descripcion_empresa}
                            </p>
                          )}
                          
                          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Globe className="h-4 w-4" />
                              /{empresa.slug_empresa}
                            </span>
                            {empresa.correo_empresa && (
                              <span className="flex items-center gap-1">
                                <Mail className="h-4 w-4" />
                                {empresa.correo_empresa}
                              </span>
                            )}
                            {empresa.telefono_empresa && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-4 w-4" />
                                {empresa.telefono_empresa}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {formatDate(empresa.fecha_creacion)}
                            </span>
                          </div>

                          {/* Personalización */}
                          {(empresa.color_primario || empresa.tipografia) && (
                            <div className="flex items-center gap-4 mt-3">
                              {empresa.color_primario && (
                                <div className="flex items-center gap-2">
                                  <Palette className="h-4 w-4 text-gray-400" />
                                  <div className="flex gap-1">
                                    <div 
                                      className="w-4 h-4 rounded border"
                                      style={{ backgroundColor: empresa.color_primario }}
                                      title="Color Primario"
                                    />
                                    {empresa.color_secundario && (
                                      <div 
                                        className="w-4 h-4 rounded border"
                                        style={{ backgroundColor: empresa.color_secundario }}
                                        title="Color Secundario"
                                      />
                                    )}
                                  </div>
                                </div>
                              )}
                              {empresa.tipografia && (
                                <span className="text-sm text-gray-500">
                                  {empresa.tipografia}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="flex items-center gap-2"
                      >
                        <Link href={`/${empresa.slug_empresa}`} target="_blank">
                          <Eye className="h-4 w-4" />
                          Ver Sitio
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleEstadoEmpresa(empresa.id)}
                        className="flex items-center gap-2"
                      >
                        <Power className="h-4 w-4" />
                        {empresa.estado_sitio === 'publicado' ? 'Desactivar' : 'Activar'}
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                      >
                        <Link href={`/admin/empresas/${empresa.id}/editar`}>
                          <Edit className="h-4 w-4" />
                          Editar
                        </Link>
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => eliminarEmpresa(empresa.id, empresa.nombre_empresa)}
                        className="flex items-center gap-2 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Paginación (si necesitas más adelante) */}
        {filteredEmpresas.length > 0 && (
          <div className="mt-8 flex justify-center">
            <p className="text-sm text-gray-600">
              Mostrando {filteredEmpresas.length} de {empresas.length} sitios web
            </p>
          </div>
        )}
          </>
        ) : (
          /* Pestaña de Administradores */
          <AdminEmpresasManager empresas={empresas} />
        )}
      </div>
    </div>
  );
}
