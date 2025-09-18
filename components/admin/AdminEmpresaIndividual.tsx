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
  Trash2
} from 'lucide-react';
import { 
  AdminEmpresaCompleto, 
  Empresa 
} from '@/lib/types/webgenerator';

// Interfaz simplificada para el formulario de administradores
interface SimpleAdminFormData {
  empresa_id: number;
  email: string;
  password: string;
  nombre: string;
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
    activo: true
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
        apellidos: '', // Campo opcional
        email: formData.email,
        password: formData.password,
        telefono: '', // Campo opcional
        fecha_nacimiento: null, // Campo opcional
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
            apellidos: '',
            email: formData.email,
            telefono: '',
            fecha_nacimiento: null,
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
      activo: admin.activo
    });
    setShowForm(true);
  };

  const deleteAdmin = async () => {
    if (!admin || !window.confirm('¿Estás seguro de eliminar este administrador?')) return;
    
    try {
      const response = await fetch(`/api/admin/get-admin?id=${admin.id}`, {
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
                      onChange={(e) => setFormData((prev: SimpleAdminFormData) => ({ ...prev, nombre: e.target.value }))}
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
                      onChange={(e) => setFormData((prev: SimpleAdminFormData) => ({ ...prev, email: e.target.value }))}
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
