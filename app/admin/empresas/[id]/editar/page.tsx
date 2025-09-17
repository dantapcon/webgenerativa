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
// La migración ya se ha completado

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
    // Extraer el ID del video de YouTube
    let videoId = '';
    
    // Formato: youtube.com/watch?v=ID
    if (url.includes('youtube.com/watch')) {
      const urlObj = new URL(url);
      videoId = urlObj.searchParams.get('v') || '';
    } 
    // Formato: youtu.be/ID
    else if (url.includes('youtu.be/')) {
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
    // Extraer el ID del video de Vimeo
    const vimeoRegex = /vimeo\.com\/(?:video\/)?(\d+)/;
    const matches = url.match(vimeoRegex);
    const videoId = matches ? matches[1] : '';
    
    return videoId ? `https://player.vimeo.com/video/${videoId}` : '';
  } catch (error) {
    console.error('Error formateando URL de Vimeo:', error);
    return '';
  }
}

// Función para convertir URLs de Google Drive en enlaces directos
function formatGoogleDriveUrl(url: string): string {
  try {
    if (!url || !url.includes('drive.google.com')) return url;
    
    // Extraer el ID del archivo de Google Drive
    let fileId = '';
    
    // Formato: drive.google.com/file/d/ID/view
    if (url.includes('/file/d/')) {
      const parts = url.split('/file/d/');
      if (parts.length > 1) {
        fileId = parts[1].split('/')[0];
      }
    }
    // Formato: drive.google.com/open?id=ID
    else if (url.includes('open?id=')) {
      const urlObj = new URL(url);
      fileId = urlObj.searchParams.get('id') || '';
    }
    
    if (!fileId) return url;
    
    // Método principal: formato uc con export=view
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

// Función alternativa para Google Drive si la primera falla
function formatGoogleDriveUrlAlternative(url: string): string {
  try {
    if (!url || !url.includes('drive.google.com')) return url;
    
    // Extraer el ID del archivo de Google Drive
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
    
    // Método alternativo: usar googleapis
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
  } catch (error) {
    console.error('Error con método alternativo de Google Drive:', error);
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
          // Campos para el modal de ventana flotante (ahora desde ventana_flotante)
          modal_activo: data.ventana_flotante?.activo || false,
          modal_titulo: data.ventana_flotante?.titulo || '',
          modal_mensaje: data.ventana_flotante?.mensaje || '',
          modal_imagen_url: data.ventana_flotante?.imagen_url || '',
          modal_video_url: data.ventana_flotante?.video_url || '',
          modal_fondo_tipo: data.ventana_flotante?.fondo_tipo || 'color',
          modal_fondo_color: data.ventana_flotante?.fondo_color || '#ffffff',
          modal_fondo_imagen: data.ventana_flotante?.fondo_imagen || '',
          // Campo para sucursales/ubicaciones
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
    
    // Validar que no sea una imagen base64 para el campo logo_url
    if (name === 'logo_url' && value.startsWith('data:image/')) {
      showAlert('error', 'No se pueden usar imágenes en formato base64. Por favor, usa una URL de imagen válida o sube la imagen a un servicio como Imgur.');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Función auxiliar para validar categorías antes de enviar
  const procesarCategorias = () => {
    // Definir el tipo correcto para las categorías (según los requisitos de WebGeneratorService.updateEmpresa)
    type SubcategoriaType = {
      id?: number;
      nombre: string;
      descripcion: string;
      imagen_url: string;
      enlace_externo: string;
      orden: number;
    };
    
    type CategoriaType = {
      id?: number;
      nombre: string;
      descripcion: string;
      tipo_display?: 'horizontal' | 'vertical';
      orden: number;
      subcategorias: SubcategoriaType[];
    };
    
    // Clonar profundamente las categorías para evitar efectos secundarios
    const categoriasClone: any[] = JSON.parse(JSON.stringify(categorias));
    
    // Transformación a formato esperado por el servicio
    const resultado = categoriasClone
      .filter((cat: any) => cat && cat.nombre && cat.nombre.trim() !== '')
      .map((cat: any) => {
        // Crear un objeto limpio con solo los campos necesarios
        const catProcesada = {
          id: cat.id,
          nombre: cat.nombre.trim(),
          descripcion: cat.descripcion?.trim() || '',
          tipo_display: cat.tipo_display || 'horizontal',
          orden: cat.orden || 0,
          subcategorias: [] as any[]
        };
        
        // Procesar subcategorías si existen
        if (cat.subcategorias && Array.isArray(cat.subcategorias) && cat.subcategorias.length > 0) {
          catProcesada.subcategorias = cat.subcategorias
            .filter((sub: any) => sub && sub.nombre && sub.nombre.trim() !== '')
            .map((sub: any) => {
              // Preparar campos con formateo especial para URLs
              const imagenUrl = sub.imagen_url?.trim() || '';
              const enlaceExterno = sub.enlace_externo?.trim() || '';
              
              // Formateo de enlaces para cumplir con restricciones de BD
              // Estos cambios son solo para previsualización, el backend también hace la verificación
              
              // Objeto base con campos requeridos
              const subcategoriaLimpia: any = {
                id: sub.id,
                nombre: sub.nombre.trim(),
                descripcion: sub.descripcion?.trim() || '',
                imagen_url: imagenUrl,
                orden: sub.orden || 0
              };
              
              // Solo incluir enlace_externo si tiene contenido válido
              // Esto evita enviar strings vacíos que fallan en la validación de BD
              if (enlaceExterno && enlaceExterno.length > 0) {
                subcategoriaLimpia.enlace_externo = enlaceExterno;
              } else {
                // Si no hay enlace, no incluir el campo para evitar problemas con la BD
                // El backend manejará la ausencia del campo correctamente
                console.log(`Subcategoría "${sub.nombre}" sin enlace externo, omitiendo campo`);
              }
              
              console.log('Subcategoría procesada:', subcategoriaLimpia);
              return subcategoriaLimpia;
            });
        }
        
        console.log('Categoría procesada:', catProcesada);
        return catProcesada;
      });
    
    return resultado;
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

      // Validar y procesar categorías
      const categoriasValidadas = procesarCategorias();
      
      // Log para debug
      console.log('Categorías a enviar:', JSON.stringify(categoriasValidadas, null, 2));
      
      // Separar datos de empresa y ventana flotante
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

      // Datos de ventana flotante
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
      
      // Actualizar empresa con las categorías y ventana flotante
      console.log('Datos de categorías a enviar:', JSON.stringify(categoriasValidadas, null, 2));
      console.log('Datos de empresa a enviar:', JSON.stringify(datosEmpresa, null, 2));
      console.log('Datos de ventana flotante a enviar:', JSON.stringify(datosVentanaFlotante, null, 2));
      
      await WebGeneratorService.updateEmpresa(empresaId, datosEmpresa, categoriasValidadas, datosVentanaFlotante);
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

              {/* Ya no utilizaremos estos campos por ahora, ya que no existen en la base de datos
              <div className="space-y-2 border-t pt-4 border-gray-200 mt-4">
                <h3 className="text-md font-medium mb-2">Personalizar sección principal (Hero)</h3>
                ...
              </div>
              */}
              
              {/* Descripción de la empresa */}
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
                
                {/* Configuración del fondo de descripción */}
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

          {/* Personalización */}
          {activeSection === 'personalizacion' && (
          <Card>
            <CardHeader>
              <CardTitle>Personalización Visual</CardTitle>
              <CardDescription>
                Colores, tipografía e imágenes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Grid principal reorganizado para mejor distribución del espacio */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Columna 1: Colores y Tipografía */}
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
                    <p className="text-xs text-gray-500">Esta tipografía se aplicará a todo el contenido</p>
                  </div>
                </div>

                {/* Columna 2: Logo y Configuración */}
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
                        <p className="text-xs text-gray-500">
                          Compatible con Google Drive
                          <br />
                          <span className="text-red-500 font-medium">⚠️ Solo URLs válidas</span>
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="logo_tamano_px" className="text-xs">Tamaño (px)</Label>
                          <div className="space-y-1">
                            <input
                              type="range"
                              id="logo_tamano_px"
                              name="logo_tamano_px"
                              min="10"
                              max="500"
                              step="5"
                              value={formData.logo_tamano_px || 48}
                              onChange={handleInputChange}
                              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                              style={{
                                background: `linear-gradient(to right, ${formData.color_primario || '#2563eb'} 0%, ${formData.color_primario || '#2563eb'} ${((formData.logo_tamano_px || 48) - 10) / (500 - 10) * 100}%, #e5e7eb ${((formData.logo_tamano_px || 48) - 10) / (500 - 10) * 100}%, #e5e7eb 100%)`
                              }}
                            />
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                min="1"
                                max="999"
                                value={formData.logo_tamano_px || 48}
                                onChange={handleInputChange}
                                name="logo_tamano_px"
                                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                              <span className="text-xs text-gray-600">px</span>
                            </div>
                          </div>
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
                </div>

                {/* Columna 3: Tamaño del Título y Preview */}
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg border">
                    <h4 className="font-medium text-sm text-gray-700 mb-3">Título del Header</h4>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="titulo_tamano" className="text-sm">Tamaño del Título</Label>
                        <div className="space-y-2">
                          <input
                            type="range"
                            id="titulo_tamano"
                            name="titulo_tamano"
                            min="16"
                            max="64"
                            step="2"
                            value={formData.titulo_tamano || 32}
                            onChange={handleInputChange}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            style={{
                              background: `linear-gradient(to right, ${formData.color_primario || '#2563eb'} 0%, ${formData.color_primario || '#2563eb'} ${((formData.titulo_tamano || 32) - 16) / (64 - 16) * 100}%, #e5e7eb ${((formData.titulo_tamano || 32) - 16) / (64 - 16) * 100}%, #e5e7eb 100%)`
                            }}
                          />
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="16"
                              max="64"
                              value={formData.titulo_tamano || 32}
                              onChange={handleInputChange}
                              name="titulo_tamano"
                              className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-600">px</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500">
                          Rango recomendado: 16-64px
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Vista previa compacta del header */}
                  <div className="p-3 bg-white rounded-lg border">
                    <p className="text-xs text-gray-600 mb-2 font-medium">Vista Previa del Header:</p>
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                      {formData.logo_url && (
                        <div className="flex-shrink-0">
                          <img 
                            src={formData.logo_url.includes('drive.google.com') ? 
                              formatGoogleDriveUrl(formData.logo_url) : 
                              formData.logo_url} 
                            alt="Logo preview" 
                            className="object-contain rounded"
                            style={{
                              height: `${Math.min(formData.logo_tamano_px || 48, 40)}px`,
                              width: 'auto'
                            }}
                            onError={(e) => {
                              const target = e.target as HTMLElement;
                              target.style.display = 'none';
                              const fallback = target.nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                          <div 
                            className="bg-gray-200 rounded flex items-center justify-center"
                            style={{
                              height: `${Math.min(formData.logo_tamano_px || 48, 40)}px`,
                              width: `${Math.min(formData.logo_tamano_px || 48, 40)}px`,
                              display: 'none'
                            }}
                          >
                            <span className="text-xs text-gray-500">Logo</span>
                          </div>
                        </div>
                      )}
                      <h1 
                        style={{ 
                          fontSize: `${Math.min(formData.titulo_tamano || 32, 24)}px`,
                          fontFamily: `'${formData.tipografia || 'Inter'}', sans-serif`,
                          color: formData.color_primario || '#2563eb',
                          lineHeight: '1.1'
                        }}
                        className="font-bold truncate"
                      >
                        {formData.nombre_empresa || 'Empresa'}
                      </h1>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Sección de Video Promocional - Ancho completo debajo */}
              <div className="border-t pt-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm text-gray-700">Video Promocional</h4>
                      <div className="space-y-2">
                        <Label htmlFor="video_promocional_url" className="text-sm">URL del Video</Label>
                        <Input
                          id="video_promocional_url"
                          name="video_promocional_url"
                          value={formData.video_promocional_url}
                          onChange={handleInputChange}
                          placeholder="https://youtube.com/watch?v=..."
                          className="text-sm"
                        />
                        <p className="text-xs text-gray-500">
                          Compatible con YouTube, Vimeo y otros videos públicos
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="video_descripcion" className="text-sm">Descripción del Video</Label>
                        <textarea
                          id="video_descripcion"
                          name="video_descripcion"
                          value={formData.video_descripcion || ''}
                          onChange={handleInputChange}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          placeholder="Describe brevemente el contenido del video"
                        />
                        <p className="text-xs text-gray-500">
                          Este texto se mostrará junto al video en la sección promocional
                        </p>
                      </div>
                    </div>
                    
                    {formData.video_promocional_url && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Vista Previa del Video:</Label>
                        <div className="aspect-video w-full border rounded overflow-hidden bg-gray-100">
                          {formData.video_promocional_url.includes('youtube.com') || formData.video_promocional_url.includes('youtu.be') ? (
                            <iframe
                              width="100%"
                              height="100%"
                              src={formatYoutubeUrl(formData.video_promocional_url)}
                              title="Video promocional"
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              className="aspect-video"
                            ></iframe>
                          ) : formData.video_promocional_url.includes('vimeo.com') ? (
                            <iframe
                              width="100%"
                              height="100%"
                              src={formatVimeoUrl(formData.video_promocional_url)}
                              title="Video promocional"
                              frameBorder="0"
                              allow="autoplay; fullscreen; picture-in-picture"
                              allowFullScreen
                              className="aspect-video"
                            ></iframe>
                          ) : (
                            <video
                              src={formData.video_promocional_url}
                              controls
                              className="w-full h-full"
                              onError={(e) => {
                                e.currentTarget.outerHTML = '<div class="flex items-center justify-center h-full text-gray-500">El formato del video no es válido o no es accesible</div>';
                              }}
                            >
                              Tu navegador no soporta la reproducción de videos.
                            </video>
                          )}
                        </div>
                      </div>
                    )}
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
              {/* Activar/Desactivar Modal */}
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
              <p className="text-xs text-gray-500">
                Se mostrará una ventana flotante cada vez que alguien visite la página
              </p>

              {/* Campos del modal - solo visible si está activo */}
              {formData.modal_activo && (
                <div className="space-y-4 mt-4 p-4 bg-gray-50 rounded-lg border">
                  {/* Título */}
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

                  {/* Mensaje */}
                  <div className="space-y-2">
                    <Label htmlFor="modal_mensaje">Mensaje de la ventana</Label>
                    <textarea
                      id="modal_mensaje"
                      name="modal_mensaje"
                      value={formData.modal_mensaje || ''}
                      onChange={handleInputChange}
                      placeholder="Escribe tu mensaje de bienvenida, información importante o promoción..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Imagen opcional */}
                  <div className="space-y-2">
                    <Label htmlFor="modal_imagen_url">URL de imagen (opcional)</Label>
                    <Input
                      id="modal_imagen_url"
                      name="modal_imagen_url"
                      value={formData.modal_imagen_url || ''}
                      onChange={handleInputChange}
                      placeholder="https://ejemplo.com/imagen.jpg"
                    />
                    <p className="text-xs text-gray-500">
                      Imagen que aparecerá en la ventana (tamaño máximo: 300px de alto)
                    </p>
                  </div>

                  {/* Video opcional */}
                  <div className="space-y-2">
                    <Label htmlFor="modal_video_url">URL de video (opcional)</Label>
                    <Input
                      id="modal_video_url"
                      name="modal_video_url"
                      value={formData.modal_video_url || ''}
                      onChange={handleInputChange}
                      placeholder="https://youtube.com/watch?v=... o https://vimeo.com/..."
                    />
                    <p className="text-xs text-gray-500">
                      Compatible con YouTube, Vimeo y otros videos públicos. Se puede mostrar junto con la imagen.
                    </p>
                    
                    {formData.modal_video_url && (
                      <div className="mt-2">
                        <Label className="text-xs text-gray-600 mb-1 block">Vista previa del video:</Label>
                        <div className="aspect-video w-full max-w-xs border rounded overflow-hidden bg-gray-100">
                          {formData.modal_video_url.includes('youtube.com') || formData.modal_video_url.includes('youtu.be') ? (
                            <iframe
                              width="100%"
                              height="100%"
                              src={formatYoutubeUrl(formData.modal_video_url)}
                              title="Video del modal"
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              className="aspect-video"
                            ></iframe>
                          ) : formData.modal_video_url.includes('vimeo.com') ? (
                            <iframe
                              width="100%"
                              height="100%"
                              src={formatVimeoUrl(formData.modal_video_url)}
                              title="Video del modal"
                              frameBorder="0"
                              allow="autoplay; fullscreen; picture-in-picture"
                              allowFullScreen
                              className="aspect-video"
                            ></iframe>
                          ) : (
                            <video
                              src={formData.modal_video_url}
                              controls
                              className="w-full h-full"
                              onError={(e) => {
                                e.currentTarget.outerHTML = '<div class="flex items-center justify-center h-full text-gray-500 text-xs">Formato de video no válido</div>';
                              }}
                            >
                              Tu navegador no soporta la reproducción de videos.
                            </video>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Configuración de fondo */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Tipo de fondo */}
                    <div className="space-y-2">
                      <Label htmlFor="modal_fondo_tipo">Tipo de fondo</Label>
                      <select
                        id="modal_fondo_tipo"
                        name="modal_fondo_tipo"
                        value={formData.modal_fondo_tipo || 'color'}
                        onChange={handleInputChange}
                        className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="color">Color sólido</option>
                        <option value="imagen">Imagen de fondo</option>
                      </select>
                    </div>

                    {/* Color de fondo */}
                    {formData.modal_fondo_tipo === 'color' && (
                      <div className="space-y-2">
                        <Label htmlFor="modal_fondo_color">Color de fondo</Label>
                        <div className="flex gap-2">
                          <Input
                            id="modal_fondo_color"
                            name="modal_fondo_color"
                            type="color"
                            value={formData.modal_fondo_color || '#ffffff'}
                            onChange={handleInputChange}
                            className="w-16 h-10 p-1"
                          />
                          <Input
                            type="text"
                            value={formData.modal_fondo_color || '#ffffff'}
                            onChange={(e) => setFormData(prev => ({ ...prev, modal_fondo_color: e.target.value }))}
                            className="flex-1 h-10"
                            placeholder="#ffffff"
                          />
                        </div>
                      </div>
                    )}

                    {/* Imagen de fondo */}
                    {formData.modal_fondo_tipo === 'imagen' && (
                      <div className="space-y-2">
                        <Label htmlFor="modal_fondo_imagen">URL de imagen de fondo</Label>
                        <Input
                          id="modal_fondo_imagen"
                          name="modal_fondo_imagen"
                          value={formData.modal_fondo_imagen || ''}
                          onChange={handleInputChange}
                          placeholder="https://ejemplo.com/fondo.jpg"
                        />
                        <p className="text-xs text-gray-500">
                          Se aplicará una capa semi-transparente para mejorar la legibilidad
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Vista previa del modal */}
                  {(formData.modal_titulo || formData.modal_mensaje) && (
                    <div className="mt-4">
                      <Label className="text-sm font-medium text-gray-700 mb-2 block">Vista previa de la ventana:</Label>
                      <div className="border rounded-lg p-4 bg-white shadow-sm max-w-md" style={{
                        background: formData.modal_fondo_tipo === 'imagen' && formData.modal_fondo_imagen
                          ? `linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9)), url("${formData.modal_fondo_imagen}") center/cover no-repeat`
                          : formData.modal_fondo_color || '#ffffff'
                      }}>
                        {formData.modal_titulo && (
                          <h3 className="text-lg font-bold text-gray-800 mb-2">
                            {formData.modal_titulo}
                          </h3>
                        )}
                        
                        {/* Mostrar imagen si está presente */}
                        {formData.modal_imagen_url && (
                          <div className="flex justify-center mb-2">
                            <img
                              src={formData.modal_imagen_url}
                              alt="Vista previa"
                              className="max-w-full h-auto rounded max-h-24 object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                        
                        {/* Mostrar video si está presente */}
                        {formData.modal_video_url && (
                          <div className="flex justify-center mb-2">
                            <div className="aspect-video w-full max-w-xs border rounded overflow-hidden bg-gray-100">
                              {formData.modal_video_url.includes('youtube.com') || formData.modal_video_url.includes('youtu.be') ? (
                                <iframe
                                  width="100%"
                                  height="100%"
                                  src={formatYoutubeUrl(formData.modal_video_url)}
                                  title="Video del modal"
                                  frameBorder="0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                  className="aspect-video"
                                ></iframe>
                              ) : formData.modal_video_url.includes('vimeo.com') ? (
                                <iframe
                                  width="100%"
                                  height="100%"
                                  src={formatVimeoUrl(formData.modal_video_url)}
                                  title="Video del modal"
                                  frameBorder="0"
                                  allow="autoplay; fullscreen; picture-in-picture"
                                  allowFullScreen
                                  className="aspect-video"
                                ></iframe>
                              ) : (
                                <video
                                  src={formData.modal_video_url}
                                  controls
                                  className="w-full h-full"
                                  onError={(e) => {
                                    e.currentTarget.outerHTML = '<div class="flex items-center justify-center h-full text-gray-500 text-xs">Formato de video no válido</div>';
                                  }}
                                >
                                  Tu navegador no soporta la reproducción de videos.
                                </video>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {formData.modal_mensaje && (
                          <p className="text-gray-700 text-sm whitespace-pre-line">
                            {formData.modal_mensaje}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
              )}

          {/* Sucursales/Ubicaciones - Manejado fuera del formulario */}
          {activeSection === 'categorias' && (
          <Card>
            <CardHeader>
              <CardTitle>Categorías</CardTitle>
              <CardDescription>
                Gestionar las categorías y subcategorías del sitio web
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {categorias.map((categoria, catIndex) => (
                <div key={categoria.id || catIndex} className="mb-6 p-4 border rounded-md border-blue-200 bg-blue-50/50 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-blue-800">
                      <span className="inline-block bg-blue-100 text-blue-800 rounded-full px-3 py-1 mr-2">
                        {catIndex + 1}
                      </span>
                      Categoría: {categoria.nombre || 'Sin nombre'}
                    </h4>
                    <div className="flex items-center gap-2">
                      {/* Botones de reordenamiento para categorías */}
                      <div className="flex flex-col">
                        <Button 
                          type="button"
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6"
                          onClick={() => {
                            if (catIndex === 0) return;
                            
                            const newCategorias = [...categorias];
                            const temp = newCategorias[catIndex];
                            newCategorias[catIndex] = newCategorias[catIndex - 1];
                            newCategorias[catIndex - 1] = temp;
                            setCategorias(newCategorias);
                          }}
                          disabled={catIndex === 0}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={catIndex === 0 ? "text-gray-300" : "text-blue-700"}>
                            <path d="m18 15-6-6-6 6"/>
                          </svg>
                        </Button>
                        <Button 
                          type="button"
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6"
                          onClick={() => {
                            if (catIndex === categorias.length - 1) return;
                            
                            const newCategorias = [...categorias];
                            const temp = newCategorias[catIndex];
                            newCategorias[catIndex] = newCategorias[catIndex + 1];
                            newCategorias[catIndex + 1] = temp;
                            setCategorias(newCategorias);
                          }}
                          disabled={catIndex === categorias.length - 1}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={catIndex === categorias.length - 1 ? "text-gray-300" : "text-blue-700"}>
                            <path d="m6 9 6 6 6-6"/>
                          </svg>
                        </Button>
                      </div>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => {
                          const newCategorias = [...categorias];
                          newCategorias.splice(catIndex, 1);
                          setCategorias(newCategorias);
                        }}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid gap-3 mb-4">
                    <div>
                      <Label htmlFor={`cat-nombre-${catIndex}`}>Nombre</Label>
                      <Input
                        id={`cat-nombre-${catIndex}`}
                        value={categoria.nombre}
                        onChange={(e) => {
                          const newCategorias = [...categorias];
                          newCategorias[catIndex].nombre = e.target.value;
                          setCategorias(newCategorias);
                        }}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor={`cat-descripcion-${catIndex}`}>Descripción</Label>
                      <textarea
                        id={`cat-descripcion-${catIndex}`}
                        value={categoria.descripcion}
                        onChange={(e) => {
                          const newCategorias = [...categorias];
                          newCategorias[catIndex].descripcion = e.target.value;
                          setCategorias(newCategorias);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={2}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor={`cat-tipo-display-${catIndex}`}>Tipo de visualización de subcategorías</Label>
                      <select
                        id={`cat-tipo-display-${catIndex}`}
                        value={categoria.tipo_display || 'horizontal'}
                        onChange={(e) => {
                          const newCategorias = [...categorias];
                          newCategorias[catIndex].tipo_display = e.target.value as 'horizontal' | 'vertical';
                          setCategorias(newCategorias);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="horizontal">Horizontal (Por defecto)</option>
                        <option value="vertical">Vertical</option>
                      </select>
                      <p className="text-sm text-gray-500 mt-1">Define cómo se mostrarán las subcategorías en el sitio web</p>
                    </div>
                    
                    <div>
                      <Label htmlFor={`cat-orden-${catIndex}`}>Orden</Label>
                      <Input
                        id={`cat-orden-${catIndex}`}
                        type="number"
                        value={categoria.orden || catIndex + 1}
                        onChange={(e) => {
                          const newCategorias = [...categorias];
                          newCategorias[catIndex].orden = parseInt(e.target.value);
                          setCategorias(newCategorias);
                        }}
                      />
                    </div>
                  </div>
                  
                  {/* Subcategorías */}
                  <div className="mt-5 pt-4 border-t border-blue-100">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600 mr-2">
                          <path d="M9 18h6"></path>
                          <path d="M12 22V9"></path>
                          <circle cx="12" cy="6" r="3"></circle>
                        </svg>
                        <h5 className="text-sm font-medium text-gray-700">Subcategorías de {categoria.nombre || 'esta categoría'}</h5>
                      </div>
                      <Button 
                        type="button"
                        variant="outline" 
                        size="sm"
                        className="bg-green-50 border-green-200 hover:bg-green-100 text-green-700 flex items-center gap-1"
                        onClick={() => {
                          const newCategorias = [...categorias];
                          if (!newCategorias[catIndex].subcategorias) {
                            newCategorias[catIndex].subcategorias = [];
                          }
                          
                          // Agregar nueva subcategoría (sin ID para que se detecte como nueva)
                          const nuevaSubcategoria = {
                            nombre: '',
                            descripcion: '',
                            imagen_url: '',
                            enlace_externo: '', // Mantener el campo pero como string vacío
                            orden: (newCategorias[catIndex].subcategorias?.length || 0) + 1
                          };
                          
                          newCategorias[catIndex].subcategorias.push(nuevaSubcategoria);
                          
                          console.log('Nueva subcategoría agregada:', nuevaSubcategoria);
                          
                          setCategorias(newCategorias);
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12h14"></path>
                          <path d="M12 5v14"></path>
                        </svg>
                        Añadir Subcategoría
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mb-3 ml-4">Las subcategorías se mostrarán dentro de esta categoría en el sitio web.</p>
                    
                    {categoria.subcategorias && categoria.subcategorias.map((subcategoria, subIndex) => (
                      <div key={subcategoria.id || `${catIndex}-${subIndex}`} className="p-3 mb-3 border rounded-md border-l-4 border-cyan-500 bg-cyan-50 shadow-sm ml-4 relative">
                        {/* Línea conectora visual entre categoría y subcategoría */}
                        <div className="absolute -left-4 top-1/2 w-4 h-0.5 bg-cyan-500"></div>
                        
                        <div className="flex items-center justify-between mb-2">
                          <h6 className="text-sm font-medium flex items-center text-cyan-800">
                            <span className="inline-block bg-cyan-100 text-cyan-800 rounded-full px-2 py-0.5 text-xs mr-2">
                              {subIndex + 1}
                            </span>
                            Subcategoría: {subcategoria.nombre || 'Sin nombre'}
                          </h6>
                          <div className="flex items-center gap-2">
                            {/* Botones de reordenamiento */}
                            <div className="flex flex-col">
                              <Button 
                                type="button"
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6"
                                onClick={() => {
                                  if (subIndex === 0) return;
                                  
                                  const newCategorias = JSON.parse(JSON.stringify(categorias));
                                  if (newCategorias[catIndex].subcategorias) {
                                    const temp = newCategorias[catIndex].subcategorias[subIndex];
                                    newCategorias[catIndex].subcategorias[subIndex] = newCategorias[catIndex].subcategorias[subIndex - 1];
                                    newCategorias[catIndex].subcategorias[subIndex - 1] = temp;
                                    setCategorias(newCategorias);
                                  }
                                }}
                                disabled={subIndex === 0}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={subIndex === 0 ? "text-gray-300" : "text-gray-700"}>
                                  <path d="m18 15-6-6-6 6"/>
                                </svg>
                              </Button>
                              <Button 
                                type="button"
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6"
                                onClick={() => {
                                  const lastIndex = categoria.subcategorias ? categoria.subcategorias.length - 1 : 0;
                                  if (subIndex === lastIndex) return;
                                  
                                  const newCategorias = JSON.parse(JSON.stringify(categorias));
                                  if (newCategorias[catIndex].subcategorias) {
                                    const temp = newCategorias[catIndex].subcategorias[subIndex];
                                    newCategorias[catIndex].subcategorias[subIndex] = newCategorias[catIndex].subcategorias[subIndex + 1];
                                    newCategorias[catIndex].subcategorias[subIndex + 1] = temp;
                                    setCategorias(newCategorias);
                                  }
                                }}
                                disabled={subIndex === (categoria.subcategorias ? categoria.subcategorias.length - 1 : 0)}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={subIndex === (categoria.subcategorias ? categoria.subcategorias.length - 1 : 0) ? "text-gray-300" : "text-gray-700"}>
                                  <path d="m6 9 6 6 6-6"/>
                                </svg>
                              </Button>
                            </div>
                            <Button 
                              type="button"
                              variant="destructive" 
                              size="sm"
                              onClick={() => {
                                const newCategorias = [...categorias];
                                if (newCategorias[catIndex].subcategorias) {
                                  newCategorias[catIndex].subcategorias.splice(subIndex, 1);
                                  setCategorias(newCategorias);
                                }
                              }}
                            >
                              Eliminar
                            </Button>
                          </div>
                        </div>
                        
                        <div className="grid gap-2">
                          <div>
                            <Label htmlFor={`sub-nombre-${catIndex}-${subIndex}`} className="text-xs">Nombre</Label>
                            <Input
                              id={`sub-nombre-${catIndex}-${subIndex}`}
                              value={subcategoria.nombre || ''}
                              onChange={(e) => {
                                const newCategorias = JSON.parse(JSON.stringify(categorias));
                                if (!newCategorias[catIndex].subcategorias[subIndex]) {
                                  newCategorias[catIndex].subcategorias[subIndex] = {};
                                }
                                newCategorias[catIndex].subcategorias[subIndex].nombre = e.target.value;
                                setCategorias(newCategorias);
                              }}
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor={`sub-desc-${catIndex}-${subIndex}`} className="text-xs">Descripción</Label>
                            <textarea
                              id={`sub-desc-${catIndex}-${subIndex}`}
                              value={subcategoria.descripcion || ''}
                              onChange={(e) => {
                                const newCategorias = JSON.parse(JSON.stringify(categorias));
                                if (!newCategorias[catIndex].subcategorias[subIndex]) {
                                  newCategorias[catIndex].subcategorias[subIndex] = {};
                                }
                                newCategorias[catIndex].subcategorias[subIndex].descripcion = e.target.value;
                                setCategorias(newCategorias);
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              rows={2}
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor={`sub-img-${catIndex}-${subIndex}`} className="text-xs">URL de Imagen</Label>
                            <div className="flex">
                              <Input
                                id={`sub-img-${catIndex}-${subIndex}`}
                                value={subcategoria.imagen_url || ''}
                                onChange={(e) => {
                                  const newCategorias = JSON.parse(JSON.stringify(categorias));
                                  if (!newCategorias[catIndex].subcategorias[subIndex]) {
                                    newCategorias[catIndex].subcategorias[subIndex] = {};
                                  }
                                  
                                  // Limpiar y formatear la URL si es necesario
                                  const url = e.target.value.trim();
                                  
                                  // Validar que no sea una imagen base64
                                  if (url.startsWith('data:image/')) {
                                    showAlert('error', 'No se pueden usar imágenes en formato base64. Por favor, usa una URL de imagen válida o sube la imagen a un servicio como Imgur.');
                                    return;
                                  }
                                  
                                  newCategorias[catIndex].subcategorias[subIndex].imagen_url = url;
                                  setCategorias(newCategorias);
                                }}
                                placeholder="https://ejemplo.com/imagen.jpg o URL de Google Drive"
                                className="flex-1"
                              />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Introduce la URL completa de la imagen. Compatible con enlaces de Google Drive.
                            </p>
                            {subcategoria.imagen_url && (
                              <div className="mt-2">
                                <img 
                                  src={subcategoria.imagen_url.includes('drive.google.com') ? 
                                    formatGoogleDriveUrl(subcategoria.imagen_url) : 
                                    subcategoria.imagen_url} 
                                  alt="Vista previa" 
                                  className="h-20 object-contain rounded border"
                                  onError={(e) => {
                                    const imgElement = e.target as HTMLImageElement;
                                    const currentSrc = imgElement.src;
                                    
                                    console.error("Error cargando imagen:", {
                                      originalUrl: subcategoria.imagen_url,
                                      processedUrl: currentSrc,
                                      error: e
                                    });
                                    
                                    // Si es una URL de Google Drive y falló el primer método, probar alternativo
                                    if (subcategoria.imagen_url.includes('drive.google.com') && currentSrc.includes('uc?export=view')) {
                                      console.log("Probando método alternativo para Google Drive...");
                                      imgElement.src = formatGoogleDriveUrlAlternative(subcategoria.imagen_url);
                                    } else {
                                      // Si ya falló todo, mostrar placeholder
                                      imgElement.src = "https://placehold.co/400x300?text=Imagen+no+disponible";
                                    }
                                  }}
                                  onLoad={() => {
                                    console.log("Imagen cargada exitosamente:", subcategoria.imagen_url);
                                  }}
                                />
                              </div>
                            )}
                          </div>
                          
                          <div>
                            <Label htmlFor={`sub-link-${catIndex}-${subIndex}`} className="text-xs">Enlace Externo</Label>
                            <div className="flex">
                              <Input
                                id={`sub-link-${catIndex}-${subIndex}`}
                                value={subcategoria.enlace_externo || ''}
                                onChange={(e) => {
                                  const newCategorias = JSON.parse(JSON.stringify(categorias));
                                  if (!newCategorias[catIndex].subcategorias[subIndex]) {
                                    newCategorias[catIndex].subcategorias[subIndex] = {};
                                  }
                                  
                                  // Almacenar sin formatear para mantener lo que el usuario escribió
                                  newCategorias[catIndex].subcategorias[subIndex].enlace_externo = e.target.value.trim();
                                  setCategorias(newCategorias);
                                }}
                                placeholder="ejemplo.com/pagina.html"
                                className="flex-1"
                              />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {subcategoria.enlace_externo ? 
                                `Se guardará como: ${subcategoria.enlace_externo.match(/^https?:\/\//) ? 
                                  subcategoria.enlace_externo : 
                                  `https://${subcategoria.enlace_externo}`}` : 
                                "El 'https://' se añadirá automáticamente si no lo incluyes"}
                            </p>
                          </div>
                          
                          <div>
                            <Label htmlFor={`sub-orden-${catIndex}-${subIndex}`} className="text-xs">Orden</Label>
                            <Input
                              id={`sub-orden-${catIndex}-${subIndex}`}
                              type="number"
                              value={subcategoria.orden || subIndex + 1}
                              onChange={(e) => {
                                const newCategorias = JSON.parse(JSON.stringify(categorias));
                                if (!newCategorias[catIndex].subcategorias[subIndex]) {
                                  newCategorias[catIndex].subcategorias[subIndex] = {};
                                }
                                newCategorias[catIndex].subcategorias[subIndex].orden = parseInt(e.target.value);
                                setCategorias(newCategorias);
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              <Button 
                type="button"
                variant="outline" 
                onClick={() => {
                  setCategorias([
                    ...categorias,
                    {
                      nombre: '',
                      descripcion: '',
                      orden: categorias.length + 1,
                      subcategorias: []
                    }
                  ]);
                }}
              >
                Añadir Nueva Categoría
              </Button>
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