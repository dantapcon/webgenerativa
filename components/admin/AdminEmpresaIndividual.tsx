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
  Shield,
  CheckCircle,
  XCircle,
  Save,
  Trash2
} from 'lucide-react';
import { 
  AdminEmpresaCompleto, 
  AdminPaginaFormData, 
  PermisosAdminEmpresa,
  PERMISOS_DESCRIPCION,
  Empresa 
} from '@/lib/types/webgenerator';

interface AdminEmpresaIndividualProps {
  empresa: Empresa;
}

export default function AdminEmpresaIndividual({ empresa }: AdminEmpresaIndividualProps) {
  const [admin, setAdmin] = useState<AdminEmpresaCompleto | null>(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<AdminPaginaFormData>({
    empresa_id: empresa.id,
    email: '',
    password: '',
    nombre: '',
    activo: true,
    login_habilitado: false,
    permisos: {}
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadAdmin();
  }, [empresa.id]);

  const loadAdmin = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/empresas?empresa_id=${empresa.id}`);
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
      const url = '/api/admin/empresas';
      const method = editMode ? 'PUT' : 'POST';
      
      const body = editMode && admin 
        ? { admin_id: admin.id, ...formData }
        : formData;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
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
      activo: true,
      login_habilitado: false,
      permisos: {}
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
      activo: admin.activo,
      login_habilitado: admin.login_habilitado,
      permisos: admin.permisos || {}
    });
    setShowForm(true);
  };

  const toggleLogin = async () => {
    if (!admin) return;
    
    try {
      const response = await fetch('/api/admin/auth', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          empresa_id: empresa.id,
          enabled: !admin.login_habilitado
        }),
      });

      const result = await response.json();
      if (result.success) {
        await loadAdmin();
        setSuccess(`Login ${!admin.login_habilitado ? 'habilitado' : 'deshabilitado'} exitosamente`);
      }
    } catch (error) {
      setError('Error al cambiar estado de login');
    }
  };

  const deleteAdmin = async () => {
    if (!admin || !window.confirm('¿Estás seguro de eliminar este administrador?')) return;
    
    try {
      const response = await fetch(`/api/admin/empresas?admin_id=${admin.id}`, {
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

  const updatePermiso = (permiso: keyof PermisosAdminEmpresa, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      permisos: {
        ...prev.permisos,
        [permiso]: value
      }
    }));
  };

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
                  {admin.login_habilitado ? (
                    <Badge variant="default" className="bg-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Login Habilitado
                    </Badge>
                  ) : (
                    <Badge variant="outline">
                      <XCircle className="h-3 w-3 mr-1" />
                      Login Deshabilitado
                    </Badge>
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
                  onClick={toggleLogin}
                >
                  <Shield className="h-3 w-3 mr-1" />
                  {admin.login_habilitado ? 'Deshabilitar' : 'Habilitar'}
                </Button>
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
                    <Label htmlFor="nombre">Nombre completo</Label>
                    <Input
                      id="nombre"
                      value={formData.nombre}
                      onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                      placeholder="Ej: Juan Pérez"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="admin@empresa.com"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="password">
                      {editMode ? 'Nueva contraseña (dejar vacío para mantener)' : 'Contraseña'}
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
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
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, activo: !!checked }))}
                    />
                    <Label htmlFor="activo">Administrador activo</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="login_habilitado"
                      checked={formData.login_habilitado}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, login_habilitado: !!checked }))}
                    />
                    <Label htmlFor="login_habilitado">Login habilitado</Label>
                  </div>
                </div>

                {/* Permisos */}
                <div>
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Permisos de Edición
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    {Object.entries(PERMISOS_DESCRIPCION).map(([key, description]) => (
                      <div key={key} className="flex items-start space-x-2">
                        <Checkbox
                          id={key}
                          checked={!!(formData.permisos as any)?.[key]}
                          onCheckedChange={(checked) => updatePermiso(key as keyof PermisosAdminEmpresa, !!checked)}
                        />
                        <div>
                          <Label htmlFor={key} className="text-sm font-medium">
                            {key.replace('puede_editar_', '').replace(/_/g, ' ').toUpperCase()}
                          </Label>
                          <p className="text-xs text-gray-600">{description as string}</p>
                        </div>
                      </div>
                    ))}
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
