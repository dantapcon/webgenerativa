'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Categoria } from '@/lib/types/webgenerator';
import { Palette, Image, Save, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

interface CategoriaFondoManagerProps {
  empresaId: number;
  onCambiosGuardados?: () => void;
}

interface ConfiguracionFondo {
  categoriaId: number;
  fondo_tipo: 'color' | 'imagen';
  fondo_color: string;
  fondo_imagen: string;
}

export default function CategoriaFondoManager({ empresaId, onCambiosGuardados }: CategoriaFondoManagerProps) {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [configuraciones, setConfiguraciones] = useState<Record<number, ConfiguracionFondo>>({});
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);

  // Cargar categorías al montar el componente
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
        
        // Inicializar configuraciones con valores actuales
        const configsIniciales: Record<number, ConfiguracionFondo> = {};
        result.data.forEach((categoria: Categoria) => {
          configsIniciales[categoria.id] = {
            categoriaId: categoria.id,
            fondo_tipo: categoria.fondo_tipo || 'color',
            fondo_color: categoria.fondo_color || '#ffffff',
            fondo_imagen: categoria.fondo_imagen || ''
          };
        });
        setConfiguraciones(configsIniciales);
      } else {
        mostrarMensaje('error', result.error || 'Error al cargar categorías');
      }
    } catch (error) {
      console.error('Error cargando categorías:', error);
      mostrarMensaje('error', 'Error de conexión al cargar categorías');
    } finally {
      setCargando(false);
    }
  };

  const mostrarMensaje = (tipo: 'success' | 'error', texto: string) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje(null), 5000);
  };

  const actualizarConfiguracion = (categoriaId: number, campo: keyof ConfiguracionFondo, valor: any) => {
    setConfiguraciones(prev => ({
      ...prev,
      [categoriaId]: {
        ...prev[categoriaId],
        [campo]: valor
      }
    }));
  };

  const guardarConfiguracion = async (categoriaId: number) => {
    try {
      setGuardando(true);
      const config = configuraciones[categoriaId];
      
      if (!config) {
        mostrarMensaje('error', 'Configuración no encontrada');
        return;
      }

      const response = await fetch(`/api/categorias/${categoriaId}/fondo`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fondo_tipo: config.fondo_tipo,
          fondo_color: config.fondo_color,
          fondo_imagen: config.fondo_imagen || null
        }),
      });

      const result = await response.json();

      if (result.success) {
        mostrarMensaje('success', `Configuración de "${result.data.nombre}" guardada exitosamente`);
        
        // Actualizar categoría en el estado local
        setCategorias(prev => prev.map(cat => 
          cat.id === categoriaId 
            ? { ...cat, ...result.data }
            : cat
        ));

        if (onCambiosGuardados) {
          onCambiosGuardados();
        }
      } else {
        mostrarMensaje('error', result.error || 'Error al guardar configuración');
      }
    } catch (error) {
      console.error('Error guardando configuración:', error);
      mostrarMensaje('error', 'Error de conexión al guardar');
    } finally {
      setGuardando(false);
    }
  };

  const guardarTodasLasConfiguraciones = async () => {
    try {
      setGuardando(true);
      
      const actualizaciones = Object.values(configuraciones).map(config => ({
        categoriaId: config.categoriaId,
        fondo_tipo: config.fondo_tipo,
        fondo_color: config.fondo_color,
        fondo_imagen: config.fondo_imagen || null
      }));

      const response = await fetch('/api/categorias/fondo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          empresaId,
          actualizaciones
        }),
      });

      const result = await response.json();

      if (result.success) {
        const exitosas = result.resultados.exitosas;
        const fallidas = result.resultados.fallidas;
        
        if (fallidas > 0) {
          mostrarMensaje('error', `${exitosas} configuraciones guardadas, ${fallidas} fallaron`);
        } else {
          mostrarMensaje('success', `Todas las configuraciones (${exitosas}) guardadas exitosamente`);
        }

        // Recargar categorías para reflejar cambios
        await cargarCategorias();

        if (onCambiosGuardados) {
          onCambiosGuardados();
        }
      } else {
        mostrarMensaje('error', result.error || 'Error al guardar configuraciones');
      }
    } catch (error) {
      console.error('Error guardando todas las configuraciones:', error);
      mostrarMensaje('error', 'Error de conexión al guardar todas las configuraciones');
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>Cargando configuración de fondos...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Configuración de Fondos de Categorías
          </CardTitle>
          <CardDescription>
            Personaliza el color de fondo o imagen de fondo para cada categoría de productos/servicios.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Button 
              onClick={guardarTodasLasConfiguraciones}
              disabled={guardando || categorias.length === 0}
              className="ml-auto"
            >
              {guardando ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Guardar Todas las Configuraciones
            </Button>
          </div>

          {mensaje && (
            <Alert className={`mb-4 ${mensaje.tipo === 'success' ? 'border-green-500' : 'border-red-500'}`}>
              {mensaje.tipo === 'success' ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription>{mensaje.texto}</AlertDescription>
            </Alert>
          )}

          {categorias.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No se encontraron categorías para esta empresa. Crea categorías primero.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid gap-4">
              {categorias.map((categoria) => {
                const config = configuraciones[categoria.id];
                if (!config) return null;

                return (
                  <Card key={categoria.id} className="border border-gray-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{categoria.nombre}</CardTitle>
                          <div className="flex gap-2 mt-1">
                            <Badge variant={categoria.visible ? 'default' : 'secondary'}>
                              {categoria.visible ? 'Visible' : 'Oculta'}
                            </Badge>
                            <Badge variant="outline">
                              {config.fondo_tipo === 'color' ? 'Color' : 'Imagen'}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => guardarConfiguracion(categoria.id)}
                          disabled={guardando}
                        >
                          {guardando ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Selector de tipo de fondo */}
                        <div className="space-y-2">
                          <Label>Tipo de Fondo</Label>
                          <div className="flex gap-2">
                            <Button
                              variant={config.fondo_tipo === 'color' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => actualizarConfiguracion(categoria.id, 'fondo_tipo', 'color')}
                              className="flex-1"
                            >
                              <Palette className="h-4 w-4 mr-2" />
                              Color
                            </Button>
                            <Button
                              variant={config.fondo_tipo === 'imagen' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => actualizarConfiguracion(categoria.id, 'fondo_tipo', 'imagen')}
                              className="flex-1"
                            >
                              <Image className="h-4 w-4 mr-2" />
                              Imagen
                            </Button>
                          </div>
                        </div>

                        {/* Configuración de color */}
                        {config.fondo_tipo === 'color' && (
                          <div className="space-y-2">
                            <Label htmlFor={`color-${categoria.id}`}>Color de Fondo</Label>
                            <div className="flex gap-2">
                              <Input
                                id={`color-${categoria.id}`}
                                type="color"
                                value={config.fondo_color}
                                onChange={(e) => actualizarConfiguracion(categoria.id, 'fondo_color', e.target.value)}
                                className="w-16 h-10 p-1 border rounded"
                              />
                              <Input
                                type="text"
                                value={config.fondo_color}
                                onChange={(e) => actualizarConfiguracion(categoria.id, 'fondo_color', e.target.value)}
                                placeholder="#ffffff"
                                className="flex-1"
                              />
                            </div>
                          </div>
                        )}

                        {/* Configuración de imagen */}
                        {config.fondo_tipo === 'imagen' && (
                          <div className="space-y-2">
                            <Label htmlFor={`imagen-${categoria.id}`}>URL de Imagen de Fondo</Label>
                            <Input
                              id={`imagen-${categoria.id}`}
                              type="url"
                              value={config.fondo_imagen}
                              onChange={(e) => actualizarConfiguracion(categoria.id, 'fondo_imagen', e.target.value)}
                              placeholder="https://ejemplo.com/imagen.jpg"
                            />
                          </div>
                        )}
                      </div>

                      {/* Vista previa del fondo */}
                      <div className="mt-4">
                        <Label>Vista Previa</Label>
                        <div 
                          className="mt-2 h-20 border rounded-md flex items-center justify-center text-white font-medium shadow-sm"
                          style={{
                            backgroundColor: config.fondo_tipo === 'color' ? config.fondo_color : 'transparent',
                            backgroundImage: config.fondo_tipo === 'imagen' && config.fondo_imagen 
                              ? `url(${config.fondo_imagen})` 
                              : 'none',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat'
                          }}
                        >
                          <span 
                            className="px-3 py-1 rounded bg-black/50 text-sm"
                            style={{ 
                              textShadow: '1px 1px 2px rgba(0,0,0,0.8)' 
                            }}
                          >
                            {categoria.nombre}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}