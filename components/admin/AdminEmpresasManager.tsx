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
  Building, 
  Settings, 
  Eye, 
  EyeOff, 
  Plus,
  Edit,
  Trash2,
  Shield,
  CheckCircle,
  XCircle,
  Save
} from 'lucide-react';
import { 
  AdminEmpresaCompleto, 
  AdminPaginaFormData, 
  PermisosAdminEmpresa,
  PERMISOS_DESCRIPCION,
  Empresa 
} from '@/lib/types/oftalmologia';

interface AdminEmpresasManagerProps {
  empresas: Empresa[];
}

export default function AdminEmpresasManager({ empresas }: AdminEmpresasManagerProps) {
  const [admins, setAdmins] = useState<AdminEmpresaCompleto[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminEmpresaCompleto | null>(null);
  const [formData, setFormData] = useState<AdminPaginaFormData>({
    empresa_id: 0,
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
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    // En una implementación real, cargarías todos los admins
    // Por ahora, mostraremos la estructura
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const url = editingAdmin ? '/api/admin/empresas' : '/api/admin/empresas';
      const method = editingAdmin ? 'PUT' : 'POST';
      
      const body = editingAdmin 
        ? { admin_id: editingAdmin.id, ...formData }
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
        setSuccess(editingAdmin ? 'Administrador actualizado' : 'Administrador creado');
        resetForm();
        await loadAdmins();
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
      empresa_id: 0,
      email: '',
      password: '',
      nombre: '',
      activo: true,
      login_habilitado: false,
      permisos: {}
    });
    setEditingAdmin(null);
    setShowForm(false);
    setShowPassword(false);
  };

  const handleEdit = (admin: AdminEmpresaCompleto) => {
    setEditingAdmin(admin);
    setFormData({
      empresa_id: admin.empresa_id,
      email: admin.email,
      password: '', // No prellenar contraseña
      nombre: admin.nombre,
      activo: admin.activo,
      login_habilitado: admin.login_habilitado,
      permisos: admin.permisos || {}
    });
    setShowForm(true);
  };

  const toggleLogin = async (admin: AdminEmpresaCompleto) => {
    try {
      const response = await fetch('/api/admin/auth', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          empresa_id: admin.empresa_id,
          enabled: !admin.login_habilitado
        }),
      });

      const result = await response.json();
      if (result.success) {
        await loadAdmins();
        setSuccess(`Login ${!admin.login_habilitado ? 'habilitado' : 'deshabilitado'}`);
      }
    } catch (error) {
      setError('Error al cambiar estado de login');
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Administradores de Empresas</h2>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Administrador
        </Button>
      </div>

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

      {/* Lista de administradores existentes */}
      <div className="grid gap-4">
        {admins.map((admin) => (
          <Card key={admin.id}>
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
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Building className="h-3 w-3" />
                    {admin.empresa?.nombre_empresa || `Empresa ID: ${admin.empresa_id}`}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleLogin(admin)}
                  >
                    <Shield className="h-3 w-3 mr-1" />
                    {admin.login_habilitado ? 'Deshabilitar' : 'Habilitar'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(admin)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Formulario de creación/edición */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>
                {editingAdmin ? 'Editar Administrador' : 'Nuevo Administrador'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Información básica */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="empresa">Empresa</Label>
                    <select
                      id="empresa"
                      value={formData.empresa_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, empresa_id: parseInt(e.target.value) }))}
                      className="w-full p-2 border rounded"
                      required
                      disabled={!!editingAdmin}
                    >
                      <option value={0}>Seleccionar empresa</option>
                      {empresas.map((empresa) => (
                        <option key={empresa.id} value={empresa.id}>
                          {empresa.nombre_empresa}
                        </option>
                      ))}
                    </select>
                  </div>

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

                  <div>
                    <Label htmlFor="password">
                      {editingAdmin ? 'Nueva contraseña (dejar vacío para mantener)' : 'Contraseña'}
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="••••••••"
                        required={!editingAdmin}
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
                    disabled={loading || !formData.empresa_id || !formData.email || !formData.nombre}
                    className="flex-1"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Guardando...' : editingAdmin ? 'Actualizar' : 'Crear'}
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
