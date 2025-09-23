'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft, 
  Save, 
  Building, 
  Phone,
  Mail,
  MapPin,
  Palette,
  Settings,
  ExternalLink,
  FolderOpen,
  Shield,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { SECCIONES_EDITABLES } from '@/lib/constants/permisos';
import { Alert, AlertDescription } from '@/components/ui/alert';
import CategoriaFondoManager from '@/components/admin/CategoriaFondoManager';

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
  correo_empresa?: string;
  telefono_empresa?: string;
  direccion_empresa?: string;
  tipo_negocio?: string;
  color_primario?: string;
  color_secundario?: string;
  tipografia?: string;
  logo_url?: string;
  logo_tamano?: string;
  logo_posicion?: string;
}

export default function EditarEmpresaAdmin() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const empresaId = params.empresaId as string;
  const seccionActual = searchParams.get('seccion') || 'info_basica';
  
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);
  const [permisos, setPermisos] = useState<PermisoAdmin[]>([]);
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [adminInfo, setAdminInfo] = useState<any>(null);
  const [formData, setFormData] = useState<Partial<Empresa>>({});

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

  useEffect(() => {
    if (empresa) {
      setFormData(empresa);
    }
  }, [empresa]);

  const checkAuthentication = async () => {
    try {
      const response = await fetch('/api/admin/auth');
      const result = await response.json();

      if (!result.success) {
        router.push('/auth/login');
        return;
      }

      const user = result.user as UserSession;

      if (user.role !== 2 && user.role !== 1) {
        setError('No tienes permisos de administrador');
        return;
      }

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
    try {
      const response = await fetch(`/api/admin/get-admin?empresa_id=${empresaId}`);
      const result = await response.json();
      
      if (result.success && result.data) {
        setAdminInfo(result.data);
      }
    } catch (error) {
      console.error('Error cargando información del admin:', error);
    }
  };

  const cargarPermisos = async () => {
    if (!adminInfo?.id) return;
    
    try {
      const response = await fetch(`/api/admin/permisos?admin_id=${adminInfo.id}&empresa_id=${empresaId}`);
      const result = await response.json();
      
      if (result.success) {
        setPermisos(result.data.permisos_activos || []);
      }
    } catch (error) {
      console.error('Error cargando permisos:', error);
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

  const handleInputChange = (field: keyof Empresa, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGuardar = async () => {
    if (!tienePermiso(seccionActual)) {
      setError('No tienes permisos para editar esta sección');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/empresas/${empresaId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('Cambios guardados exitosamente');
        setEmpresa({ ...empresa, ...formData } as Empresa);
      } else {
        setError(result.error || 'Error al guardar los cambios');
      }
    } catch (error) {
      setError('Error al guardar los cambios');
    } finally {
      setSaving(false);
    }
  };

  const renderSeccionFormulario = () => {
    const seccion = SECCIONES_EDITABLES[seccionActual as keyof typeof SECCIONES_EDITABLES];
    
    if (!seccion || !tienePermiso(seccionActual)) {
      return (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No tienes permisos para editar esta sección o la sección no existe.
          </AlertDescription>
        </Alert>
      );
    }

    switch (seccionActual) {
      case 'info_basica':
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="nombre_empresa">Nombre de la Empresa</Label>
              <Input
                id="nombre_empresa"
                value={formData.nombre_empresa || ''}
                onChange={(e) => handleInputChange('nombre_empresa', e.target.value)}
                placeholder="Ej: Mi Empresa S.A."
              />
            </div>
            
            <div>
              <Label htmlFor="descripcion_empresa">Descripción</Label>
              <Input
                id="descripcion_empresa"
                value={formData.descripcion_empresa || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('descripcion_empresa', e.target.value)}
                placeholder="Describe tu empresa..."
              />
            </div>
            
            <div>
              <Label htmlFor="tipo_negocio">Tipo de Negocio</Label>
              <Input
                id="tipo_negocio"
                value={formData.tipo_negocio || ''}
                onChange={(e) => handleInputChange('tipo_negocio', e.target.value)}
                placeholder="Ej: Restaurante, Tienda, Servicios..."
              />
            </div>
          </div>
        );
        
      case 'info_contacto':
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="correo_empresa">Correo Electrónico</Label>
              <Input
                id="correo_empresa"
                type="email"
                value={formData.correo_empresa || ''}
                onChange={(e) => handleInputChange('correo_empresa', e.target.value)}
                placeholder="info@miempresa.com"
              />
            </div>
            
            <div>
              <Label htmlFor="telefono_empresa">Teléfono</Label>
              <Input
                id="telefono_empresa"
                value={formData.telefono_empresa || ''}
                onChange={(e) => handleInputChange('telefono_empresa', e.target.value)}
                placeholder="Ej: +593 99 123 4567"
              />
            </div>
            
            <div>
              <Label htmlFor="direccion_empresa">Dirección</Label>
              <Input
                id="direccion_empresa"
                value={formData.direccion_empresa || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('direccion_empresa', e.target.value)}
                placeholder="Dirección completa de la empresa"
              />
            </div>
          </div>
        );
        
      case 'personalizacion_visual':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="color_primario">Color Primario</Label>
                <div className="flex gap-2">
                  <Input
                    id="color_primario"
                    type="color"
                    value={formData.color_primario || '#000000'}
                    onChange={(e) => handleInputChange('color_primario', e.target.value)}
                    className="w-16 h-10"
                  />
                  <Input
                    value={formData.color_primario || ''}
                    onChange={(e) => handleInputChange('color_primario', e.target.value)}
                    placeholder="#000000"
                    className="flex-1"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="color_secundario">Color Secundario</Label>
                <div className="flex gap-2">
                  <Input
                    id="color_secundario"
                    type="color"
                    value={formData.color_secundario || '#ffffff'}
                    onChange={(e) => handleInputChange('color_secundario', e.target.value)}
                    className="w-16 h-10"
                  />
                  <Input
                    value={formData.color_secundario || ''}
                    onChange={(e) => handleInputChange('color_secundario', e.target.value)}
                    placeholder="#ffffff"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <Label htmlFor="tipografia">Tipografía</Label>
              <Input
                id="tipografia"
                value={formData.tipografia || ''}
                onChange={(e) => handleInputChange('tipografia', e.target.value)}
                placeholder="Ej: Arial, Helvetica, sans-serif"
              />
            </div>
            
            <div>
              <Label htmlFor="logo_url">URL del Logo</Label>
              <Input
                id="logo_url"
                value={formData.logo_url || ''}
                onChange={(e) => handleInputChange('logo_url', e.target.value)}
                placeholder="https://ejemplo.com/logo.png"
              />
            </div>
          </div>
        );
        
      case 'fondos_categorias':
        return (
          <div className="space-y-6">
            <CategoriaFondoManager 
              empresaId={parseInt(empresaId)}
              onCambiosGuardados={() => {
                setMensaje({
                  tipo: 'success',
                  texto: 'Configuración de fondos actualizada exitosamente'
                });
                setTimeout(() => setMensaje(null), 3000);
              }}
            />
          </div>
        );
        
      default:
        return (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Esta sección está en desarrollo. Próximamente estará disponible.
            </AlertDescription>
          </Alert>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Cargando...</div>
      </div>
    );
  }

  if (error && !empresa) {
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

  const seccion = SECCIONES_EDITABLES[seccionActual as keyof typeof SECCIONES_EDITABLES];
  const seccionesPermitidas = Object.values(SECCIONES_EDITABLES).filter(s => 
    tienePermiso(s.id)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/dashboard-admin/${empresaId}`)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver al Dashboard
              </Button>
              
              <div className="border-l pl-3">
                <h1 className="text-xl font-semibold text-gray-900">
                  Editar: {seccion?.nombre || 'Sección'}
                </h1>
                <p className="text-sm text-gray-600">
                  {empresa?.nombre_empresa}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                {userSession?.email}
              </div>
              <Button
                onClick={handleGuardar}
                disabled={saving || !tienePermiso(seccionActual)}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Navegación entre secciones */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Secciones Disponibles</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <nav className="space-y-1">
                  {seccionesPermitidas.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => router.push(`/dashboard-admin/${empresaId}/editar?seccion=${s.id}`)}
                      className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 flex items-center gap-3 ${
                        seccionActual === s.id ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' : 'text-gray-700'
                      }`}
                    >
                      {seccionActual === s.id && <CheckCircle className="h-4 w-4" />}
                      <span>{s.nombre}</span>
                    </button>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </div>
          
          {/* Content Area */}
          <div className="lg:col-span-3">
            {/* Alerts */}
            {error && (
              <Alert className="mb-6 border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert className="mb-6 border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            {mensaje && (
              <Alert className={`mb-6 ${mensaje.tipo === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                {mensaje.tipo === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <AlertDescription>{mensaje.texto}</AlertDescription>
              </Alert>
            )}
            
            {/* Form Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  {seccion?.nombre}
                </CardTitle>
                <CardDescription>
                  {seccion?.descripcion}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {renderSeccionFormulario()}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}