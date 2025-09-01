'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { EmpresaFormData, EmpresaCompleta } from '@/lib/types/oftalmologia';
import { WebGeneratorService } from '@/lib/services/oftalmologia';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, Eye, Building } from 'lucide-react';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditarEmpresaPage({ params }: PageProps) {
  const router = useRouter();
  const [empresaId, setEmpresaId] = useState<number | null>(null);
  const [formData, setFormData] = useState<EmpresaFormData>({
    nombre_empresa: '',
    descripcion_empresa: '',
    correo_empresa: '',
    telefono_empresa: '',
    direccion_empresa: '',
    tipo_negocio: '',
    dominio_deseado: '',
    logo_url: '',
    video_promocional_url: '',
    color_primario: '#2563eb',
    color_secundario: '#1e40af',
    tipografia: 'Inter'
  });
  const [empresa, setEmpresa] = useState<EmpresaCompleta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  // Obtener parámetros de forma asíncrona
  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      const id = parseInt(resolvedParams.id);
      setEmpresaId(id);
    };
    getParams();
  }, [params]);

  // Cargar datos de la empresa
  useEffect(() => {
    const cargarEmpresa = async () => {
      if (!empresaId) return;
      
      setIsLoading(true);
      try {
        const data = await WebGeneratorService.getEmpresaById(empresaId);
        if (!data) {
          showAlert('error', 'Empresa no encontrada');
          router.push('/admin/empresas');
          return;
        }
        
        setEmpresa(data);
        
        // Poblar formulario con datos existentes
        setFormData({
          nombre_empresa: data.nombre_empresa,
          descripcion_empresa: data.descripcion_empresa || '',
          correo_empresa: data.correo_empresa || '',
          telefono_empresa: data.telefono_empresa || '',
          direccion_empresa: data.direccion_empresa || '',
          tipo_negocio: data.tipo_negocio || '',
          dominio_deseado: data.dominio_deseado || '',
          logo_url: data.logo_url || '',
          video_promocional_url: data.video_promocional_url || '',
          color_primario: data.color_primario || '#2563eb',
          color_secundario: data.color_secundario || '#1e40af',
          tipografia: data.tipografia || 'Inter'
        });
      } catch (error) {
        console.error('Error cargando empresa:', error);
        showAlert('error', 'Error al cargar los datos de la empresa');
      } finally {
        setIsLoading(false);
      }
    };

    cargarEmpresa();
  }, [empresaId, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empresaId) return;
    
    setIsSaving(true);
    
    try {
      // Validar campos requeridos
      if (!formData.nombre_empresa) {
        showAlert('error', 'El nombre de la empresa es requerido');
        return;
      }

      await WebGeneratorService.updateEmpresa(empresaId, formData);
      showAlert('success', 'Empresa actualizada exitosamente');
      
      // Recargar datos
      setTimeout(() => {
        router.push('/admin/empresas');
      }, 2000);
      
    } catch (error) {
      console.error('Error actualizando empresa:', error);
      showAlert('error', 'Error al actualizar la empresa');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando datos de la empresa...</p>
        </div>
      </div>
    );
  }

  if (!empresa) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Empresa no encontrada</h2>
          <p className="text-gray-600 mb-4">La empresa que buscas no existe o ha sido eliminada.</p>
          <Button asChild>
            <Link href="/admin/empresas">Volver al listado</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" asChild>
              <Link href="/admin/empresas">
                <ArrowLeft className="h-4 w-4" />
                Volver
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Editar Empresa</h1>
              <p className="text-gray-600">{empresa.nombre_empresa}</p>
            </div>
          </div>
          <Button variant="outline" asChild>
            <Link href={`/${empresa.slug_empresa}`} target="_blank">
              <Eye className="h-4 w-4 mr-2" />
              Ver Sitio
            </Link>
          </Button>
        </div>

        {alert && (
          <Alert className={`${alert.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} mb-6`}>
            <AlertDescription className={alert.type === 'success' ? 'text-green-800' : 'text-red-800'}>
              {alert.message}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Información básica */}
          <Card>
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
              <CardDescription>
                Datos principales de la empresa
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre_empresa">Nombre de la Empresa *</Label>
                  <Input
                    id="nombre_empresa"
                    name="nombre_empresa"
                    value={formData.nombre_empresa}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tipo_negocio">Tipo de Negocio</Label>
                  <select
                    id="tipo_negocio"
                    name="tipo_negocio"
                    value={formData.tipo_negocio}
                    onChange={handleInputChange}
                    className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecciona un tipo</option>
                    <option value="servicios">Servicios</option>
                    <option value="comercio">Comercio</option>
                    <option value="tecnologia">Tecnología</option>
                    <option value="salud">Salud</option>
                    <option value="educacion">Educación</option>
                    <option value="restaurante">Restaurante</option>
                    <option value="inmobiliaria">Inmobiliaria</option>
                    <option value="consultoria">Consultoría</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descripcion_empresa">Descripción</Label>
                <textarea
                  id="descripcion_empresa"
                  name="descripcion_empresa"
                  value={formData.descripcion_empresa}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </CardContent>
          </Card>

          {/* Información de contacto */}
          <Card>
            <CardHeader>
              <CardTitle>Información de Contacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="correo_empresa">Email</Label>
                  <Input
                    id="correo_empresa"
                    name="correo_empresa"
                    type="email"
                    value={formData.correo_empresa}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefono_empresa">Teléfono</Label>
                  <Input
                    id="telefono_empresa"
                    name="telefono_empresa"
                    value={formData.telefono_empresa}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="direccion_empresa">Dirección</Label>
                <Input
                  id="direccion_empresa"
                  name="direccion_empresa"
                  value={formData.direccion_empresa}
                  onChange={handleInputChange}
                />
              </div>
            </CardContent>
          </Card>

          {/* Personalización */}
          <Card>
            <CardHeader>
              <CardTitle>Personalización Visual</CardTitle>
              <CardDescription>
                Colores, tipografía e imágenes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="color_primario">Color Primario</Label>
                      <div className="flex gap-2">
                        <Input
                          id="color_primario"
                          name="color_primario"
                          type="color"
                          value={formData.color_primario}
                          onChange={handleInputChange}
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          value={formData.color_primario}
                          onChange={(e) => setFormData(prev => ({ ...prev, color_primario: e.target.value }))}
                          placeholder="#2563eb"
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="color_secundario">Color Secundario</Label>
                      <div className="flex gap-2">
                        <Input
                          id="color_secundario"
                          name="color_secundario"
                          type="color"
                          value={formData.color_secundario}
                          onChange={handleInputChange}
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          value={formData.color_secundario}
                          onChange={(e) => setFormData(prev => ({ ...prev, color_secundario: e.target.value }))}
                          placeholder="#1e40af"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tipografia">Tipografía</Label>
                    <select
                      id="tipografia"
                      name="tipografia"
                      value={formData.tipografia}
                      onChange={handleInputChange}
                      className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Inter">Inter (Moderno)</option>
                      <option value="Roboto">Roboto (Universal)</option>
                      <option value="Poppins">Poppins (Amigable)</option>
                      <option value="Open Sans">Open Sans (Legible)</option>
                      <option value="Montserrat">Montserrat (Elegante)</option>
                      <option value="Lato">Lato (Profesional)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="logo_url">URL del Logo</Label>
                    <Input
                      id="logo_url"
                      name="logo_url"
                      value={formData.logo_url}
                      onChange={handleInputChange}
                      placeholder="https://ejemplo.com/logo.png"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="video_promocional_url">Video Promocional</Label>
                    <Input
                      id="video_promocional_url"
                      name="video_promocional_url"
                      value={formData.video_promocional_url}
                      onChange={handleInputChange}
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </div>
                </div>

                {/* Vista previa */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-800">Vista Previa</h4>
                  <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
                    <div 
                      className="h-16 flex items-center justify-center text-white font-semibold"
                      style={{ 
                        background: `linear-gradient(135deg, ${formData.color_primario} 0%, ${formData.color_secundario} 100%)`,
                        fontFamily: `'${formData.tipografia}', sans-serif`
                      }}
                    >
                      {formData.nombre_empresa || 'Nombre de Empresa'}
                    </div>
                    <div className="p-4 space-y-3">
                      <div 
                        className="text-gray-700"
                        style={{ fontFamily: `'${formData.tipografia}', sans-serif` }}
                      >
                        {formData.descripcion_empresa || 'Descripción de la empresa...'}
                      </div>
                      <button
                        className="px-4 py-2 text-white rounded-lg"
                        style={{ backgroundColor: formData.color_primario }}
                      >
                        Botón de Ejemplo
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configuración adicional */}
          <Card>
            <CardHeader>
              <CardTitle>Configuración Adicional</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dominio_deseado">Dominio Personalizado</Label>
                <Input
                  id="dominio_deseado"
                  name="dominio_deseado"
                  value={formData.dominio_deseado}
                  onChange={handleInputChange}
                  placeholder="mi-empresa.com"
                />
                <p className="text-sm text-gray-500">
                  Actualmente disponible en: <code>/{empresa.slug_empresa}</code>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Botones de acción */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" asChild>
              <Link href="/admin/empresas">Cancelar</Link>
            </Button>
            <Button 
              type="submit" 
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
