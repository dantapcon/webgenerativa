'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Mail, 
  Settings, 
  Eye, 
  EyeOff, 
  Plus,
  Edit,
  CheckCircle,
  XCircle,
  Save,
  Trash2,
  Shield,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { 
  AdminEmpresaCompleto, 
  Empresa 
} from '@/lib/types/webgenerator';
import { SECCIONES_EDITABLES } from '@/lib/constants/permisos';

// Tipo para permisos del administrador
interface PermisoAdmin {
  id_permi: number;
  nombre_permi: string;
  descripcion_per: string;
  id_empresa: number;
  id_rol: number;
}

// Interfaz simplificada para el formulario de administradores
interface SimpleAdminFormData {
  empresa_id: number;
  email: string;
  password: string;
  nombre: string;
  apellidos: string;
  telefono: string;
  fecha_nacimiento: string | null;
  activo: boolean;
}

interface AdminEmpresaIndividualProps {
  empresa: Empresa;
}

export default function AdminEmpresaIndividual({ empresa }: AdminEmpresaIndividualProps) {
  const [admin, setAdmin] = useState<AdminEmpresaCompleto | null>(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<SimpleAdminFormData>({
    empresa_id: empresa.id,
    email: '',
    password: '',
    nombre: '',
    apellidos: '',
    telefono: '',
    fecha_nacimiento: null,
    activo: true
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Estado para manejo de permisos
  const [permisos, setPermisos] = useState<PermisoAdmin[]>([]);
  const [loadingPermisos, setLoadingPermisos] = useState(false);
  const [mostrarPermisos, setMostrarPermisos] = useState(false);

  useEffect(() => {
    loadAdmin();
  }, [empresa.id]);

  const loadAdmin = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/get-admin?empresa_id=${empresa.id}`);
      const result = await response.json();
      
      if (response.ok && result.success && result.data) {
        setAdmin(result.data);
      } else if (response.status === 404) {
        // No existe administrador para esta empresa - comportamiento normal
        setAdmin(null);
      } else {
        setAdmin(null);
        console.warn('No se pudo cargar administrador para empresa:', empresa.id);
      }
    } catch (error) {
      console.error('Error cargando admin:', error);
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Preparar datos para la nueva API
      const body = {
        nombres: formData.nombre,
        apellidos: formData.apellidos || '',
        email: formData.email,
        password: formData.password,
        telefono: formData.telefono || '',
        fecha_nacimiento: formData.fecha_nacimiento || null,
        empresa_id: formData.empresa_id,
        activo: formData.activo
      };

      const url = editMode ? '/api/admin/get-admin' : '/api/admin/create-admin';
      const method = editMode ? 'PUT' : 'POST';

      // Si está editando, usar la nueva API
      const requestBody = editMode && admin 
        ? { 
            admin_id: admin.id, 
            nombres: formData.nombre,
            apellidos: formData.apellidos || '',
            email: formData.email,
            telefono: formData.telefono || '',
            fecha_nacimiento: formData.fecha_nacimiento || null,
            activo: formData.activo
          }
        : body;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(editMode ? 'Administrador actualizado exitosamente' : 'Administrador creado exitosamente');
        resetForm();
        await loadAdmin();
      } else {
        setError(result.error || 'Error en la operación');
      }
    } catch (error) {
      setError('Error de conexión');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      empresa_id: empresa.id,
      email: '',
      password: '',
      nombre: '',
      apellidos: '',
      telefono: '',
      fecha_nacimiento: null,
      activo: true
    });
    setShowForm(false);
    setEditMode(false);
    setShowPassword(false);
  };

  const handleEdit = () => {
    if (!admin) return;
    
    setEditMode(true);
    setFormData({
      empresa_id: empresa.id,
      email: admin.email,
      password: '', // No prellenar contraseña
      nombre: admin.nombre,
      apellidos: admin.apellidos || '',
      telefono: admin.telefono || '',
      fecha_nacimiento: admin.fecha_nacimiento || null,
      activo: admin.activo
    });
    setShowForm(true);
  };

  const deleteAdmin = async () => {
    if (!admin || !window.confirm('¿Estás seguro de eliminar este administrador?')) return;
    
    try {
      const response = await fetch(`/api/admin/get-admin?admin_id=${admin.id}`, {
        method: 'DELETE'
      });

      const result = await response.json();
      if (result.success) {
        setAdmin(null);
        setSuccess('Administrador eliminado exitosamente');
      }
    } catch (error) {
      setError('Error al eliminar administrador');
    }
  };

  // Funciones para gestión de permisos
  const cargarPermisos = async () => {
    if (!admin) return;
    
    setLoadingPermisos(true);
    try {
      const response = await fetch(`/api/admin/permisos?admin_id=${admin.id}&empresa_id=${empresa.id}`);
      const result = await response.json();
      
      if (result.success) {
        setPermisos(result.data.permisos_activos || []);
      } else {
        console.error('Error en API permisos:', result.error);
      }
    } catch (error) {
      console.error('Error cargando permisos:', error);
    } finally {
      setLoadingPermisos(false);
    }
  };

  const guardarPermisos = async () => {
    if (!admin) return;

    setLoadingPermisos(true);
    try {
      const response = await fetch('/api/admin/permisos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          admin_id: admin.id,
          empresa_id: empresa.id,
          permisos_seleccionados: permisos
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setSuccess('Permisos actualizados exitosamente');
      } else {
        setError(result.error || 'Error actualizando permisos');
      }
    } catch (error) {
      setError('Error al guardar permisos');
    } finally {
      setLoadingPermisos(false);
    }
  };

  const togglePermiso = (permisoId: string) => {
    setPermisos(current => {
      const tienePermiso = current.some(p => p.nombre_permi === permisoId);
      
      if (tienePermiso) {
        // Remover permiso
        return current.filter(p => p.nombre_permi !== permisoId);
      } else {
        // Agregar permiso (crear uno temporal para el estado local)
        const nuevoPermiso: PermisoAdmin = {
          id_permi: 0, // Se asignará al guardar
          nombre_permi: permisoId,
          descripcion_per: SECCIONES_EDITABLES[permisoId as keyof typeof SECCIONES_EDITABLES]?.descripcion || '',
          id_empresa: empresa.id,
          id_rol: admin?.id || 0
        };
        return [...current, nuevoPermiso];
      }
    });
  };

  // Cargar permisos cuando se cargue el admin
  useEffect(() => {
    if (admin && mostrarPermisos) {
      cargarPermisos();
    }
  }, [admin, mostrarPermisos]);

  if (loading && !admin) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      {admin ? (
        /* Mostrar administrador existente */
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="font-medium">{admin.nombre}</span>
                  {admin.activo ? (
                    <Badge variant="default">Activo</Badge>
                  ) : (
                    <Badge variant="secondary">Inactivo</Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="h-3 w-3" />
                  {admin.email}
                </div>
                
                <div className="text-xs text-gray-500">
                  Creado: {new Date(admin.created_at).toLocaleDateString()}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEdit}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={deleteAdmin}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Mostrar botón para crear administrador */
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Sin administrador asignado
          </h3>
          <p className="text-gray-600 mb-4">
            Asigna un administrador para que pueda editar el contenido de esta página.
          </p>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Crear Administrador
          </Button>
        </div>
      )}

      {/* Sección de Permisos - Solo mostrar si hay administrador */}
      {admin && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg">Permisos de Edición</CardTitle>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMostrarPermisos(!mostrarPermisos)}
              >
                {mostrarPermisos ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-2" />
                    Ocultar
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-2" />
                    Gestionar
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          
          {mostrarPermisos && (
            <CardContent>
              {loadingPermisos ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 mb-4">
                    Selecciona las secciones que el administrador puede editar en la página de la empresa.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.values(SECCIONES_EDITABLES).map((seccion) => {
                      const tienePermiso = permisos.some(p => p.nombre_permi === seccion.id);
                      
                      return (
                        <div
                          key={seccion.id}
                          className={`border rounded-lg p-4 transition-colors ${
                            tienePermiso 
                              ? 'border-blue-200 bg-blue-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <Checkbox
                              id={seccion.id}
                              checked={tienePermiso}
                              onCheckedChange={() => togglePermiso(seccion.id)}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-lg">{seccion.icono}</span>
                                <Label 
                                  htmlFor={seccion.id}
                                  className="text-sm font-medium cursor-pointer"
                                >
                                  {seccion.nombre}
                                </Label>
                              </div>
                              <p className="text-xs text-gray-600">
                                {seccion.descripcion}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="pt-4 border-t">
                    <Button
                      onClick={guardarPermisos}
                      disabled={loading}
                      className="w-full"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {loading ? 'Guardando permisos...' : 'Guardar Permisos'}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          )}
        </Card>
      )}

      {/* Formulario de creación/edición */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>
                {editMode ? 'Editar Administrador' : 'Crear Administrador'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Información básica */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nombre">Nombres</Label>
                    <Input
                      id="nombre"
                      value={formData.nombre}
                      onChange={(e) => setFormData((prev: SimpleAdminFormData) => ({ ...prev, nombre: e.target.value }))}
                      placeholder="Ej: Juan Carlos"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="apellidos">Apellidos</Label>
                    <Input
                      id="apellidos"
                      value={formData.apellidos}
                      onChange={(e) => setFormData((prev: SimpleAdminFormData) => ({ ...prev, apellidos: e.target.value }))}
                      placeholder="Ej: Pérez García"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData((prev: SimpleAdminFormData) => ({ ...prev, email: e.target.value }))}
                      placeholder="admin@empresa.com"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input
                      id="telefono"
                      value={formData.telefono}
                      onChange={(e) => setFormData((prev: SimpleAdminFormData) => ({ ...prev, telefono: e.target.value }))}
                      placeholder="Ej: 0987654321"
                    />
                  </div>

                  <div>
                    <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento</Label>
                    <Input
                      id="fecha_nacimiento"
                      type="date"
                      value={formData.fecha_nacimiento || ''}
                      onChange={(e) => setFormData((prev: SimpleAdminFormData) => ({ ...prev, fecha_nacimiento: e.target.value || null }))}
                    />
                  </div>

                  <div className="md:col-span-1">
                    <Label htmlFor="password">
                      {editMode ? 'Nueva contraseña (dejar vacío para mantener)' : 'Contraseña'}
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => setFormData((prev: SimpleAdminFormData) => ({ ...prev, password: e.target.value }))}
                        placeholder="••••••••"
                        required={!editMode}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1 h-6 w-6 p-0"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Estados */}
                <div className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="activo"
                      checked={formData.activo}
                      onCheckedChange={(checked) => setFormData((prev: SimpleAdminFormData) => ({ ...prev, activo: !!checked }))}
                    />
                    <Label htmlFor="activo">Administrador activo</Label>
                  </div>
                </div>

                {/* Botones */}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    disabled={loading}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading || !formData.email || !formData.nombre}
                    className="flex-1"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Guardando...' : editMode ? 'Actualizar' : 'Crear'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
