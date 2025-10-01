'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import RichTextEditor from '@/components/ui/rich-text-editor';
import RichTextDisplay from '@/components/ui/rich-text-display';
import { Categoria } from '@/lib/types/webgenerator';
import { 
  Palette, 
  Image, 
  Save, 
  Loader2, 
  AlertCircle, 
  CheckCircle, 
  Plus, 
  Trash2, 
  Edit3,
  FolderOpen
} from 'lucide-react';

interface CategoriaEditorProps {
  empresaId: number;
  onCambiosGuardados?: () => void;
}

interface CategoriaFormData {
  id?: number;
  nombre: string;
  descripcion: string;
  tipo_display: 'horizontal' | 'vertical';
  orden: number;
  visible: boolean;
  fondo_tipo: 'color' | 'imagen';
  fondo_color: string;
  fondo_imagen: string;
}

export default function CategoriaEditor({ empresaId, onCambiosGuardados }: CategoriaEditorProps) {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [editandoCategoria, setEditandoCategoria] = useState<CategoriaFormData | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);

  useEffect(() => {
    cargarCategorias();
  }, [empresaId]);

  const cargarCategorias = async () => {
    try {
      setCargando(true);
      const response = await fetch(`/api/categorias/fondo?empresaId=${empresaId}`);
      const result = await response.json();

      if (result.success) {
        setCategorias(result.data);
      } else {
        setMensaje({ tipo: 'error', texto: 'Error al cargar las categorías' });
      }
    } catch (error) {
      console.error('Error cargando categorías:', error);
      setMensaje({ tipo: 'error', texto: 'Error al cargar las categorías' });
    } finally {
      setCargando(false);
    }
  };

  const iniciarEdicion = (categoria: Categoria) => {
    setEditandoCategoria({
      id: categoria.id,
      nombre: categoria.nombre,
      descripcion: categoria.descripcion || '',
      tipo_display: categoria.tipo_display || 'horizontal',
      orden: categoria.orden,
      visible: categoria.visible,
      fondo_tipo: categoria.fondo_tipo || 'color',
      fondo_color: categoria.fondo_color || '#ffffff',
      fondo_imagen: categoria.fondo_imagen || ''
    });
    setMostrarFormulario(true);
  };

  const nuevaCategoria = () => {
    setEditandoCategoria({
      nombre: '',
      descripcion: '',
      tipo_display: 'horizontal',
      orden: categorias.length,
      visible: true,
      fondo_tipo: 'color',
      fondo_color: '#ffffff',
      fondo_imagen: ''
    });
    setMostrarFormulario(true);
  };

  const cancelarEdicion = () => {
    setEditandoCategoria(null);
    setMostrarFormulario(false);
  };

  const guardarCategoria = async () => {
    if (!editandoCategoria) return;

    // Validaciones
    if (!editandoCategoria.nombre.trim()) {
      setMensaje({ tipo: 'error', texto: 'El nombre de la categoría es requerido' });
      return;
    }

    try {
      setGuardando(true);
      
      let response;
      if (editandoCategoria.id) {
        // Actualizar categoría existente
        response = await fetch(`/api/categorias/${editandoCategoria.id}/fondo`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fondo_tipo: editandoCategoria.fondo_tipo,
            fondo_color: editandoCategoria.fondo_color,
            fondo_imagen: editandoCategoria.fondo_imagen
          })
        });
      } else {
        // Crear nueva categoría
        response = await fetch('/api/categorias', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            empresa_id: empresaId,
            nombre: editandoCategoria.nombre,
            descripcion: editandoCategoria.descripcion,
            tipo_display: editandoCategoria.tipo_display,
            orden: editandoCategoria.orden,
            visible: editandoCategoria.visible,
            fondo_tipo: editandoCategoria.fondo_tipo,
            fondo_color: editandoCategoria.fondo_color,
            fondo_imagen: editandoCategoria.fondo_imagen
          })
        });
      }

      const result = await response.json();

      if (result.success) {
        setMensaje({ 
          tipo: 'success', 
          texto: editandoCategoria.id ? 'Categoría actualizada exitosamente' : 'Categoría creada exitosamente'
        });
        await cargarCategorias();
        cancelarEdicion();
        onCambiosGuardados?.();
      } else {
        setMensaje({ tipo: 'error', texto: result.error || 'Error al guardar la categoría' });
      }
    } catch (error) {
      console.error('Error guardando categoría:', error);
      setMensaje({ tipo: 'error', texto: 'Error al guardar la categoría' });
    } finally {
      setGuardando(false);
    }
  };

  const eliminarCategoria = async (id: number, nombre: string) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar la categoría "${nombre}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/categorias/${id}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        setMensaje({ tipo: 'success', texto: 'Categoría eliminada exitosamente' });
        await cargarCategorias();
        onCambiosGuardados?.();
      } else {
        setMensaje({ tipo: 'error', texto: result.error || 'Error al eliminar la categoría' });
      }
    } catch (error) {
      console.error('Error eliminando categoría:', error);
      setMensaje({ tipo: 'error', texto: 'Error al eliminar la categoría' });
    }
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Cargando categorías...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Gestión de Categorías</h2>
          <p className="text-sm text-gray-600">
            Administra las categorías de tu empresa y personaliza sus fondos
          </p>
        </div>
        <Button onClick={nuevaCategoria} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nueva Categoría
        </Button>
      </div>

      {/* Mensajes */}
      {mensaje && (
        <Alert className={`${mensaje.tipo === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
          {mensaje.tipo === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <AlertDescription>{mensaje.texto}</AlertDescription>
        </Alert>
      )}

      {/* Formulario de edición */}
      {mostrarFormulario && editandoCategoria && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit3 className="h-5 w-5" />
              {editandoCategoria.id ? 'Editar Categoría' : 'Nueva Categoría'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Nombre de la Categoría</Label>
                <Input
                  value={editandoCategoria.nombre}
                  onChange={(e) => setEditandoCategoria({
                    ...editandoCategoria,
                    nombre: e.target.value
                  })}
                  placeholder="Ej: Servicios"
                />
              </div>
              <div>
                <Label>Descripción</Label>
                <RichTextEditor
                  value={editandoCategoria.descripcion}
                  onChange={(content) => setEditandoCategoria({
                    ...editandoCategoria,
                    descripcion: content
                  })}
                  placeholder="Descripción de la categoría..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Tipo de Visualización</Label>
                <select
                  value={editandoCategoria.tipo_display}
                  onChange={(e) => setEditandoCategoria({
                    ...editandoCategoria,
                    tipo_display: e.target.value as 'horizontal' | 'vertical'
                  })}
                  className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="horizontal">Horizontal</option>
                  <option value="vertical">Vertical</option>
                </select>
              </div>
              <div>
                <Label>Tipo de Fondo</Label>
                <select
                  value={editandoCategoria.fondo_tipo}
                  onChange={(e) => setEditandoCategoria({
                    ...editandoCategoria,
                    fondo_tipo: e.target.value as 'color' | 'imagen'
                  })}
                  className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="color">Color Sólido</option>
                  <option value="imagen">Imagen de Fondo</option>
                </select>
              </div>
            </div>

            {/* Configuración de fondo */}
            {editandoCategoria.fondo_tipo === 'color' ? (
              <div>
                <Label>Color de Fondo</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={editandoCategoria.fondo_color}
                    onChange={(e) => setEditandoCategoria({
                      ...editandoCategoria,
                      fondo_color: e.target.value
                    })}
                    className="w-12 h-10 border border-gray-300 rounded-md cursor-pointer"
                  />
                  <Input
                    value={editandoCategoria.fondo_color}
                    onChange={(e) => setEditandoCategoria({
                      ...editandoCategoria,
                      fondo_color: e.target.value
                    })}
                    placeholder="#ffffff"
                    className="flex-1"
                  />
                </div>
              </div>
            ) : (
              <div>
                <Label>URL de Imagen de Fondo</Label>
                <Input
                  value={editandoCategoria.fondo_imagen}
                  onChange={(e) => setEditandoCategoria({
                    ...editandoCategoria,
                    fondo_imagen: e.target.value
                  })}
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={cancelarEdicion}>
                Cancelar
              </Button>
              <Button onClick={guardarCategoria} disabled={guardando}>
                {guardando ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de categorías */}
      <div className="grid gap-4">
        {categorias.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay categorías</h3>
              <p className="text-gray-600 mb-4">
                Crea tu primera categoría para organizar el contenido de tu empresa
              </p>
              <Button onClick={nuevaCategoria}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Primera Categoría
              </Button>
            </CardContent>
          </Card>
        ) : (
          categorias.map((categoria) => (
            <Card key={categoria.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium text-gray-900">{categoria.nombre}</h3>
                      <Badge variant={categoria.visible ? "default" : "secondary"}>
                        {categoria.visible ? 'Visible' : 'Oculta'}
                      </Badge>
                      <Badge variant="outline">
                        {categoria.tipo_display || 'horizontal'}
                      </Badge>
                    </div>
                    {categoria.descripcion && (
                      <div className="text-sm text-gray-600 mb-2">
                        <RichTextDisplay content={categoria.descripcion} />
                      </div>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Orden: {categoria.orden}</span>
                      <span className="flex items-center gap-1">
                        {categoria.fondo_tipo === 'color' ? (
                          <>
                            <Palette className="h-3 w-3" />
                            Color: {categoria.fondo_color}
                          </>
                        ) : (
                          <>
                            <Image className="h-3 w-3" />
                            Imagen de fondo
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => iniciarEdicion(categoria)}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => eliminarCategoria(categoria.id, categoria.nombre)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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