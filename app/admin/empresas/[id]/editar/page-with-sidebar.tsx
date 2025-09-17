'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { EmpresaFormData, EmpresaCompleta } from '@/lib/types/webgenerator';
import { WebGeneratorService } from '@/lib/services/webgenerator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, Eye, Building } from 'lucide-react';
import SucursalesManager from '@/components/admin/SucursalesManager';
import AdminEmpresaIndividual from '@/components/admin/AdminEmpresaIndividual';
import Link from 'next/link';

// Tipo extendido temporalmente para incluir campos de ventana flotante
interface EmpresaFormDataExtended extends EmpresaFormData {
  modal_activo?: boolean;
  modal_titulo?: string;
  modal_mensaje?: string;
  modal_imagen_url?: string;
  modal_video_url?: string;
  modal_fondo_tipo?: 'color' | 'imagen';
  modal_fondo_color?: string;
  modal_fondo_imagen?: string;
}

// Funciones auxiliares para formatear URLs de video
function formatYoutubeUrl(url: string): string {
  try {
    let videoId = '';
    if (url.includes('youtube.com/watch')) {
      const urlObj = new URL(url);
      videoId = urlObj.searchParams.get('v') || '';
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
  } catch (error) {
    console.error('Error formateando URL de YouTube:', error);
    return '';
  }
}

function formatVimeoUrl(url: string): string {
  try {
    const vimeoRegex = /vimeo\.com\/(?:video\/)?(\d+)/;
    const matches = url.match(vimeoRegex);
    const videoId = matches ? matches[1] : '';
    return videoId ? `https://player.vimeo.com/video/${videoId}` : '';
  } catch (error) {
    console.error('Error formateando URL de Vimeo:', error);
    return '';
  }
}

function formatGoogleDriveUrl(url: string): string {
  try {
    if (!url || !url.includes('drive.google.com')) return url;
    let fileId = '';
    if (url.includes('/file/d/')) {
      const parts = url.split('/file/d/');
      if (parts.length > 1) {
        fileId = parts[1].split('/')[0];
      }
    } else if (url.includes('open?id=')) {
      const urlObj = new URL(url);
      fileId = urlObj.searchParams.get('id') || '';
    }
    if (!fileId) return url;
    const convertedUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
    console.log('URL de Google Drive convertida:', {
      original: url,
      fileId: fileId,
      converted: convertedUrl
    });
    return convertedUrl;
  } catch (error) {
    console.error('Error formateando URL de Google Drive:', error);
    return url;
  }
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditarEmpresaPage({ params }: PageProps) {
  const router = useRouter();
  const [empresaId, setEmpresaId] = useState<number | null>(null);
  const [formData, setFormData] = useState<EmpresaFormDataExtended>({
    nombre_empresa: '',
    descripcion_empresa: '',
    descripcion_fondo_tipo: 'color',
    descripcion_imagen_fondo: '',
    video_descripcion: '',
    correo_empresa: '',
    telefono_empresa: '',
    direccion_empresa: '',
    tipo_negocio: '',
    dominio_deseado: '',
    logo_url: '',
    logo_tamano_px: 48,
    titulo_tamano: 32,
    video_promocional_url: '',
    color_primario: '#2563eb',
    color_secundario: '#1e40af',
    tipografia: 'Inter'
  });
  const [empresa, setEmpresa] = useState<EmpresaCompleta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [activeSection, setActiveSection] = useState('info-basica');
  
  // Estado para categorías y subcategorías
  const [categorias, setCategorias] = useState<Array<{
    id?: number;
    nombre: string;
    descripcion: string;
    tipo_display?: 'horizontal' | 'vertical';
    orden: number;
    subcategorias: Array<{
      id?: number;
      nombre: string;
      descripcion: string;
      imagen_url: string;
      enlace_externo: string;
      orden: number;
    }>;
  }>>([]);

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  // Secciones del menú lateral
  const menuSections = [
    { id: 'info-basica', label: 'Información Básica', icon: '📝' },
    { id: 'info-contacto', label: 'Información de Contacto', icon: '📞' },
    { id: 'personalizacion', label: 'Personalización Visual', icon: '🎨' },
    { id: 'config-adicional', label: 'Configuración Adicional', icon: '⚙️' },
    { id: 'ventana-flotante', label: '💬 Ventana Flotante de Bienvenida', icon: '💬' },
    { id: 'sucursales', label: '📍 Sucursales y Ubicaciones', icon: '📍' },
    { id: 'categorias', label: 'Categorías', icon: '📂' },
    { id: 'administrador', label: 'Administrador de la Página', icon: '👤' }
  ];

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
          hero_fondo_tipo: data.hero_fondo_tipo || 'color',
          hero_imagen_fondo: data.hero_imagen_fondo || '',
          descripcion_fondo_tipo: data.descripcion_fondo_tipo || 'color',
          descripcion_imagen_fondo: data.descripcion_imagen_fondo || '',
          video_descripcion: data.video_descripcion || '',
          modal_activo: data.ventana_flotante?.activo || false,
          modal_titulo: data.ventana_flotante?.titulo || '',
          modal_mensaje: data.ventana_flotante?.mensaje || '',
          modal_imagen_url: data.ventana_flotante?.imagen_url || '',
          modal_video_url: data.ventana_flotante?.video_url || '',
          modal_fondo_tipo: data.ventana_flotante?.fondo_tipo || 'color',
          modal_fondo_color: data.ventana_flotante?.fondo_color || '#ffffff',
          modal_fondo_imagen: data.ventana_flotante?.fondo_imagen || '',
          sucursales_activo: data.sucursales_activo || false,
          correo_empresa: data.correo_empresa || '',
          telefono_empresa: data.telefono_empresa || '',
          direccion_empresa: data.direccion_empresa || '',
          tipo_negocio: data.tipo_negocio || '',
          dominio_deseado: data.dominio_deseado || '',
          logo_url: data.logo_url || '',
          logo_tamano: data.logo_tamano || 'mediano',
          logo_tamano_px: data.logo_tamano_px || 48,
          logo_posicion: data.logo_posicion || 'izquierda',
          titulo_tamano: data.titulo_tamano || 32,
          video_promocional_url: data.video_promocional_url || '',
          color_primario: data.color_primario || '#2563eb',
          color_secundario: data.color_secundario || '#1e40af',
          tipografia: data.tipografia || 'Inter'
        });
        
        // Cargar categorías y subcategorías
        if (data.categorias && data.categorias.length > 0) {
          setCategorias(data.categorias.map(cat => ({
            id: cat.id,
            nombre: cat.nombre,
            descripcion: cat.descripcion || '',
            tipo_display: cat.tipo_display || 'horizontal',
            orden: cat.orden,
            subcategorias: cat.subcategorias ? cat.subcategorias.map(sub => ({
              id: sub.id,
              nombre: sub.nombre,
              descripcion: sub.descripcion || '',
              imagen_url: sub.imagen_url || '',
              enlace_externo: sub.enlace_externo || '',
              orden: sub.orden
            })) : []
          })));
        } else {
          setCategorias([]);
        }
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
    
    if (name === 'logo_url' && value.startsWith('data:image/')) {
      showAlert('error', 'No se pueden usar imágenes en formato base64. Por favor, usa una URL de imagen válida o sube la imagen a un servicio como Imgur.');
      return;
    }
    
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
      if (!formData.nombre_empresa) {
        showAlert('error', 'El nombre de la empresa es requerido');
        return;
      }

      const {
        modal_activo,
        modal_titulo,
        modal_mensaje,
        modal_imagen_url,
        modal_video_url,
        modal_fondo_tipo,
        modal_fondo_color,
        modal_fondo_imagen,
        ...datosEmpresa
      } = formData;

      const datosVentanaFlotante = {
        activo: modal_activo,
        titulo: modal_titulo,
        mensaje: modal_mensaje,
        imagen_url: modal_imagen_url,
        video_url: modal_video_url,
        fondo_tipo: modal_fondo_tipo,
        fondo_color: modal_fondo_color,
        fondo_imagen: modal_fondo_imagen
      };
      
      await WebGeneratorService.updateEmpresa(empresaId, datosEmpresa, categorias, datosVentanaFlotante);
      showAlert('success', 'Empresa actualizada exitosamente');
      
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
      <div className="flex">
        {/* Menú Lateral */}
        <div className="w-80 bg-white shadow-lg min-h-screen">
          <div className="p-6 border-b">
            <div className="flex items-center gap-3 mb-4">
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/empresas">
                  <ArrowLeft className="h-4 w-4" />
                  Volver
                </Link>
              </Button>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Editar Empresa</h1>
            <p className="text-sm text-gray-600">{empresa.nombre_empresa}</p>
            <Button variant="outline" size="sm" className="mt-3 w-full" asChild>
              <Link href={`/${empresa.slug_empresa}`} target="_blank">
                <Eye className="h-4 w-4 mr-2" />
                Ver Sitio
              </Link>
            </Button>
          </div>
          
          <nav className="p-4">
            <ul className="space-y-2">
              {menuSections.map((section) => (
                <li key={section.id}>
                  <button
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${
                      activeSection === section.id
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-lg">{section.icon}</span>
                    <span className="text-sm font-medium">{section.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Contenido Principal */}
        <div className="flex-1 p-8">
          {alert && (
            <Alert className={`${alert.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} mb-6`}>
              <AlertDescription className={alert.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                {alert.message}
              </AlertDescription>
            </Alert>
          )}

          {/* Renderizado condicional de secciones */}
          {activeSection === 'sucursales' && empresaId ? (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">📍 Gestión de Sucursales</h2>
                <p className="text-gray-600">Administrar las ubicaciones de la empresa</p>
              </div>
              <SucursalesManager empresaId={empresaId} />
            </div>
          ) : activeSection === 'administrador' ? (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">👤 Administrador de la Página</h2>
                <p className="text-gray-600">Gestionar el administrador específico de esta empresa</p>
              </div>
              <AdminEmpresaIndividual empresa={empresa} />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Información básica */}
              {activeSection === 'info-basica' && (
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

                    <div className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="descripcion_empresa">Descripción de la empresa</Label>
                        <textarea
                          id="descripcion_empresa"
                          name="descripcion_empresa"
                          value={formData.descripcion_empresa}
                          onChange={handleInputChange}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="descripcion_fondo_tipo">Tipo de fondo para descripción</Label>
                          <select
                            id="descripcion_fondo_tipo"
                            name="descripcion_fondo_tipo"
                            value={formData.descripcion_fondo_tipo || 'color'}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="color">Color sólido</option>
                            <option value="imagen">Imagen de fondo</option>
                          </select>
                        </div>
                        
                        {formData.descripcion_fondo_tipo === 'imagen' && (
                          <div className="space-y-2">
                            <Label htmlFor="descripcion_imagen_fondo">URL de la imagen de fondo</Label>
                            <Input
                              id="descripcion_imagen_fondo"
                              name="descripcion_imagen_fondo"
                              value={formData.descripcion_imagen_fondo || ''}
                              onChange={handleInputChange}
                              placeholder="https://ejemplo.com/mi-imagen.jpg"
                            />
                            <p className="text-xs text-gray-500">Para mejores resultados, usa imágenes de tonalidad clara o con transparencia</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Información de contacto */}
              {activeSection === 'info-contacto' && (
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
              )}

              {/* Personalización Visual */}
              {activeSection === 'personalizacion' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Personalización Visual</CardTitle>
                    <CardDescription>
                      Colores, tipografía e imágenes
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-lg border">
                          <h4 className="font-medium text-sm text-gray-700 mb-3">Colores de la Marca</h4>
                          <div className="space-y-3">
                            <div className="space-y-2">
                              <Label htmlFor="color_primario" className="text-sm">Color Primario</Label>
                              <div className="flex gap-2">
                                <Input
                                  id="color_primario"
                                  name="color_primario"
                                  type="color"
                                  value={formData.color_primario}
                                  onChange={handleInputChange}
                                  className="w-12 h-10 p-1"
                                />
                                <Input
                                  value={formData.color_primario}
                                  onChange={(e) => setFormData(prev => ({ ...prev, color_primario: e.target.value }))}
                                  placeholder="#2563eb"
                                  className="flex-1 text-sm"
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="color_secundario" className="text-sm">Color Secundario</Label>
                              <div className="flex gap-2">
                                <Input
                                  id="color_secundario"
                                  name="color_secundario"
                                  type="color"
                                  value={formData.color_secundario}
                                  onChange={handleInputChange}
                                  className="w-12 h-10 p-1"
                                />
                                <Input
                                  value={formData.color_secundario}
                                  onChange={(e) => setFormData(prev => ({ ...prev, color_secundario: e.target.value }))}
                                  placeholder="#1e40af"
                                  className="flex-1 text-sm"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="tipografia" className="text-sm font-medium">Tipografía</Label>
                          <select
                            id="tipografia"
                            name="tipografia"
                            value={formData.tipografia}
                            onChange={handleInputChange}
                            className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          >
                            <option value="Inter">Inter (Moderno)</option>
                            <option value="Roboto">Roboto (Universal)</option>
                            <option value="Poppins">Poppins (Amigable)</option>
                            <option value="Open Sans">Open Sans (Legible)</option>
                            <option value="Montserrat">Montserrat (Elegante)</option>
                            <option value="Lato">Lato (Profesional)</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-lg border">
                          <h4 className="font-medium text-sm text-gray-700 mb-3">Configuración del Logo</h4>
                          <div className="space-y-3">
                            <div className="space-y-2">
                              <Label htmlFor="logo_url" className="text-sm">URL del Logo</Label>
                              <Input
                                id="logo_url"
                                name="logo_url"
                                value={formData.logo_url}
                                onChange={handleInputChange}
                                placeholder="https://ejemplo.com/logo.png"
                                className="text-sm"
                              />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-2">
                                <Label htmlFor="logo_tamano_px" className="text-xs">Tamaño (px)</Label>
                                <input
                                  type="number"
                                  min="1"
                                  max="999"
                                  value={formData.logo_tamano_px || 48}
                                  onChange={handleInputChange}
                                  name="logo_tamano_px"
                                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="logo_posicion" className="text-xs">Posición</Label>
                                <select
                                  id="logo_posicion"
                                  name="logo_posicion"
                                  value={formData.logo_posicion || 'izquierda'}
                                  onChange={handleInputChange}
                                  className="w-full h-8 px-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                                >
                                  <option value="izquierda">Izquierda</option>
                                  <option value="centro">Centro</option>
                                  <option value="derecha">Derecha</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="titulo_tamano" className="text-sm">Tamaño del Título</Label>
                          <input
                            type="number"
                            min="16"
                            max="64"
                            value={formData.titulo_tamano || 32}
                            onChange={handleInputChange}
                            name="titulo_tamano"
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Configuración adicional */}
              {activeSection === 'config-adicional' && (
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
              )}

              {/* Ventana Flotante */}
              {activeSection === 'ventana-flotante' && (
                <Card>
                  <CardHeader>
                    <CardTitle>💬 Ventana Flotante de Bienvenida</CardTitle>
                    <CardDescription>
                      Configurar una ventana flotante que aparecerá cada vez que alguien visite la página
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="modal_activo"
                        name="modal_activo"
                        checked={formData.modal_activo || false}
                        onChange={(e) => setFormData(prev => ({ ...prev, modal_activo: e.target.checked }))}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <Label htmlFor="modal_activo" className="text-sm font-medium text-gray-700">
                        Activar ventana flotante de bienvenida
                      </Label>
                    </div>

                    {formData.modal_activo && (
                      <div className="space-y-4 mt-4 p-4 bg-gray-50 rounded-lg border">
                        <div className="space-y-2">
                          <Label htmlFor="modal_titulo">Título de la ventana</Label>
                          <Input
                            id="modal_titulo"
                            name="modal_titulo"
                            value={formData.modal_titulo || ''}
                            onChange={handleInputChange}
                            placeholder="Ej: ¡Bienvenido! o Información importante"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="modal_mensaje">Mensaje de la ventana</Label>
                          <textarea
                            id="modal_mensaje"
                            name="modal_mensaje"
                            value={formData.modal_mensaje || ''}
                            onChange={handleInputChange}
                            placeholder="Escribe tu mensaje de bienvenida..."
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Categorías */}
              {activeSection === 'categorias' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Categorías y Subcategorías</CardTitle>
                    <CardDescription>
                      Gestionar las categorías y subcategorías del sitio web
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        💡 <strong>Nota:</strong> La gestión completa de categorías y subcategorías 
                        está disponible mediante la integración con el componente especializado.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </form>
          )}

          {/* Botones de acción fijos en la parte inferior para formularios */}
          {activeSection !== 'sucursales' && activeSection !== 'administrador' && (
            <div className="mt-8 flex justify-end gap-4 bg-white p-6 rounded-lg border shadow-sm">
              <Button type="button" variant="outline" asChild>
                <Link href="/admin/empresas">Cancelar</Link>
              </Button>
              <Button 
                onClick={handleSubmit}
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
          )}
        </div>
      </div>
    </div>
  );
}