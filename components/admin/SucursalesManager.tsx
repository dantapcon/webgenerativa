'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useSucursales, type SucursalFormData } from '@/hooks/useSucursales';
import type { Sucursal } from '@/lib/types/webgenerator';
import { Plus, Edit2, Trash2, MapPin, Phone, Mail, Clock } from 'lucide-react';

export default function SucursalesManager() {
  const { sucursales, loading, addSucursal, updateSucursal, deleteSucursal } = useSucursales(4);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState<SucursalFormData>({
    nombre: '',
    direccion: '',
    latitud: undefined,
    longitud: undefined,
    telefono: '',
    whatsapp: '',
    email: '',
    horario_lunes: '',
    horario_martes: '',
    horario_miercoles: '',
    horario_jueves: '',
    horario_viernes: '',
    horario_sabado: '',
    horario_domingo: '',
    activo: true
  });

  const resetForm = () => {
    setFormData({
      nombre: '',
      direccion: '',
      latitud: undefined,
      longitud: undefined,
      telefono: '',
      whatsapp: '',
      email: '',
      horario_lunes: '',
      horario_martes: '',
      horario_miercoles: '',
      horario_jueves: '',
      horario_viernes: '',
      horario_sabado: '',
      horario_domingo: '',
      activo: true
    });
    setIsAddingNew(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre || !formData.direccion || !formData.latitud || !formData.longitud) {
      alert('Por favor, completa todos los campos requeridos incluyendo las coordenadas.');
      return;
    }

    try {
      if (editingId) {
        await updateSucursal(editingId, formData);
      } else {
        await addSucursal(formData);
      }
      resetForm();
      alert('Sucursal guardada exitosamente');
    } catch (error) {
      console.error('Error al guardar sucursal:', error);
      alert('Error al guardar la sucursal');
    }
  };

  const handleEdit = (sucursal: Sucursal) => {
    setFormData({
      nombre: sucursal.nombre,
      direccion: sucursal.direccion,
      latitud: sucursal.latitud ?? undefined,
      longitud: sucursal.longitud ?? undefined,
      telefono: sucursal.telefono || '',
      whatsapp: sucursal.whatsapp || '',
      email: sucursal.email || '',
      horario_lunes: sucursal.horario_lunes || '',
      horario_martes: sucursal.horario_martes || '',
      horario_miercoles: sucursal.horario_miercoles || '',
      horario_jueves: sucursal.horario_jueves || '',
      horario_viernes: sucursal.horario_viernes || '',
      horario_sabado: sucursal.horario_sabado || '',
      horario_domingo: sucursal.horario_domingo || '',
      activo: sucursal.activo
    });
    setEditingId(sucursal.id);
    setIsAddingNew(false);
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta sucursal?')) {
      try {
        await deleteSucursal(id);
      } catch (error) {
        console.error('Error al eliminar sucursal:', error);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? checked 
        : name === 'latitud' || name === 'longitud' 
          ? value === '' ? undefined : parseFloat(value) 
          : value
    }));
  };

  if (loading) {
    return <div className="p-6">Cargando sucursales...</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Gestión de Sucursales</h1>
        <p className="text-gray-600 mt-2">Administra las sucursales y ubicaciones de tu empresa</p>
      </div>

      {/* Botón para agregar nueva sucursal */}
      {!isAddingNew && editingId === null && (
        <div className="mb-6">
          <Button 
            onClick={() => setIsAddingNew(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Agregar Nueva Sucursal
          </Button>
        </div>
      )}

      {/* Formulario para agregar/editar sucursal */}
      {(isAddingNew || editingId !== null) && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              {editingId ? 'Editar Sucursal' : 'Nueva Sucursal'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nombre">Nombre de la Sucursal *</Label>
                  <Input
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="direccion">Dirección *</Label>
                  <Input
                    id="direccion"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="latitud">Latitud *</Label>
                  <Input
                    id="latitud"
                    name="latitud"
                    type="number"
                    step="any"
                    value={formData.latitud || ''}
                    onChange={handleInputChange}
                    placeholder="Ej: -0.180653"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="longitud">Longitud *</Label>
                  <Input
                    id="longitud"
                    name="longitud"
                    type="number"
                    step="any"
                    value={formData.longitud || ''}
                    onChange={handleInputChange}
                    placeholder="Ej: -78.467834"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    placeholder="Ej: 02-234-5678"
                  />
                </div>
                <div>
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleInputChange}
                    placeholder="Ej: +593987654321"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="sucursal@empresa.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="horario_lunes">Lunes</Label>
                  <Input
                    id="horario_lunes"
                    name="horario_lunes"
                    value={formData.horario_lunes}
                    onChange={handleInputChange}
                    placeholder="08:00 - 17:00"
                  />
                </div>
                <div>
                  <Label htmlFor="horario_martes">Martes</Label>
                  <Input
                    id="horario_martes"
                    name="horario_martes"
                    value={formData.horario_martes}
                    onChange={handleInputChange}
                    placeholder="08:00 - 17:00"
                  />
                </div>
                <div>
                  <Label htmlFor="horario_miercoles">Miércoles</Label>
                  <Input
                    id="horario_miercoles"
                    name="horario_miercoles"
                    value={formData.horario_miercoles}
                    onChange={handleInputChange}
                    placeholder="08:00 - 17:00"
                  />
                </div>
                <div>
                  <Label htmlFor="horario_jueves">Jueves</Label>
                  <Input
                    id="horario_jueves"
                    name="horario_jueves"
                    value={formData.horario_jueves}
                    onChange={handleInputChange}
                    placeholder="08:00 - 17:00"
                  />
                </div>
                <div>
                  <Label htmlFor="horario_viernes">Viernes</Label>
                  <Input
                    id="horario_viernes"
                    name="horario_viernes"
                    value={formData.horario_viernes}
                    onChange={handleInputChange}
                    placeholder="08:00 - 17:00"
                  />
                </div>
                <div>
                  <Label htmlFor="horario_sabado">Sábado</Label>
                  <Input
                    id="horario_sabado"
                    name="horario_sabado"
                    value={formData.horario_sabado}
                    onChange={handleInputChange}
                    placeholder="08:00 - 12:00"
                  />
                </div>
                <div>
                  <Label htmlFor="horario_domingo">Domingo</Label>
                  <Input
                    id="horario_domingo"
                    name="horario_domingo"
                    value={formData.horario_domingo}
                    onChange={handleInputChange}
                    placeholder="Cerrado"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="activo"
                  name="activo"
                  checked={formData.activo}
                  onChange={handleInputChange}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="activo">Sucursal activa</Label>
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  {editingId ? 'Actualizar' : 'Crear'} Sucursal
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Lista de sucursales */}
      <div className="grid gap-4">
        <h2 className="text-2xl font-semibold">Sucursales Existentes</h2>
        {sucursales.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-500">No hay sucursales registradas aún.</p>
            </CardContent>
          </Card>
        ) : (
          sucursales.map((sucursal) => (
            <Card key={sucursal.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">{sucursal.nombre}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={sucursal.activo ? "default" : "secondary"}>
                        {sucursal.activo ? 'Activa' : 'Inactiva'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(sucursal)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(sucursal.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{sucursal.direccion}</span>
                    </div>
                    {(sucursal.latitud && sucursal.longitud) && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>Coordenadas: {sucursal.latitud}, {sucursal.longitud}</span>
                      </div>
                    )}
                    {sucursal.telefono && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{sucursal.telefono}</span>
                      </div>
                    )}
                    {sucursal.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{sucursal.email}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">Horarios:</span>
                    </div>
                    <div className="text-sm space-y-1">
                      {sucursal.horario_lunes && <div>Lunes: {sucursal.horario_lunes}</div>}
                      {sucursal.horario_martes && <div>Martes: {sucursal.horario_martes}</div>}
                      {sucursal.horario_miercoles && <div>Miércoles: {sucursal.horario_miercoles}</div>}
                      {sucursal.horario_jueves && <div>Jueves: {sucursal.horario_jueves}</div>}
                      {sucursal.horario_viernes && <div>Viernes: {sucursal.horario_viernes}</div>}
                      {sucursal.horario_sabado && <div>Sábado: {sucursal.horario_sabado}</div>}
                      {sucursal.horario_domingo && <div>Domingo: {sucursal.horario_domingo}</div>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
