'use client';

import { useState, useEffect } from 'react';
import { EmpresaFormData } from '@/lib/types/oftalmologia';
import { WebGeneratorService } from '@/lib/services/oftalmologia';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Globe, Palette, Building, Users, Phone, Mail, MapPin, Image, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/header';

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
    
    // MÉTODO PROBADO Y CONFIRMADO: Formato correcto para imágenes de Google Drive
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
  } catch (error) {
    console.error('Error formateando URL de Google Drive:', error);
    return url;
  }
}

interface CategoriaForm {
  nombre: string;
  descripcion: string;
  tipo_display?: 'horizontal' | 'vertical';
  orden: number;
  subcategorias: SubcategoriaForm[];
}

interface SubcategoriaForm {
  nombre: string;
  descripcion: string;
  imagen_url: string;
  enlace_externo: string;
  orden: number;
}

export default function WebGeneratorPage() {
  const [formData, setFormData] = useState<EmpresaFormData>({
    nombre_empresa: '',
    descripcion_empresa: '',
    hero_fondo_tipo: 'color',
    hero_imagen_fondo: '',
    descripcion_fondo_tipo: 'color',
    descripcion_imagen_fondo: '',
    video_descripcion: '',
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

  const [categorias, setCategorias] = useState<CategoriaForm[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [activeStep, setActiveStep] = useState(1);

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

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

  const setExampleLogo = () => {
    setFormData(prev => ({
      ...prev,
      logo_url: 'https://via.placeholder.com/150x150/2563eb/white?text=LOGO'
    }));
  };

  // Funciones para manejar categorías
  const agregarCategoria = () => {
    const nuevaCategoria: CategoriaForm = {
      nombre: '',
      descripcion: '',
      tipo_display: 'horizontal', // Valor predeterminado
      orden: categorias.length,
      subcategorias: []
    };
    setCategorias([...categorias, nuevaCategoria]);
  };

  const eliminarCategoria = (index: number) => {
    setCategorias(categorias.filter((_, i) => i !== index));
  };

  const actualizarCategoria = (index: number, campo: keyof CategoriaForm, valor: any) => {
    setCategorias(categorias.map((cat, i) => 
      i === index ? { ...cat, [campo]: valor } : cat
    ));
  };

  const moverCategoria = (index: number, direccion: 'up' | 'down') => {
    const newCategorias = [...categorias];
    const newIndex = direccion === 'up' ? index - 1 : index + 1;
    
    if (newIndex >= 0 && newIndex < categorias.length) {
      [newCategorias[index], newCategorias[newIndex]] = [newCategorias[newIndex], newCategorias[index]];
      
      // Actualizar órdenes
      newCategorias.forEach((cat, i) => {
        cat.orden = i;
      });
      
      setCategorias(newCategorias);
    }
  };

  // Funciones para manejar subcategorías
  const agregarSubcategoria = (categoriaIndex: number) => {
    const nuevaSubcategoria: SubcategoriaForm = {
      nombre: '',
      descripcion: '',
      imagen_url: '',
      enlace_externo: '',
      orden: categorias[categoriaIndex].subcategorias.length
    };

    const nuevasCategorias = [...categorias];
    nuevasCategorias[categoriaIndex].subcategorias.push(nuevaSubcategoria);
    setCategorias(nuevasCategorias);
  };

  const eliminarSubcategoria = (categoriaIndex: number, subcategoriaIndex: number) => {
    const nuevasCategorias = [...categorias];
    nuevasCategorias[categoriaIndex].subcategorias = nuevasCategorias[categoriaIndex].subcategorias.filter((_, i) => i !== subcategoriaIndex);
    setCategorias(nuevasCategorias);
  };

  const actualizarSubcategoria = (categoriaIndex: number, subcategoriaIndex: number, campo: keyof SubcategoriaForm, valor: string) => {
    // Validar que no sea una imagen base64 para el campo imagen_url
    if (campo === 'imagen_url' && valor.startsWith('data:image/')) {
      showAlert('error', 'No se pueden usar imágenes en formato base64. Por favor, usa una URL de imagen válida o sube la imagen a un servicio como Imgur.');
      return;
    }
    
    const nuevasCategorias = [...categorias];
    nuevasCategorias[categoriaIndex].subcategorias[subcategoriaIndex] = {
      ...nuevasCategorias[categoriaIndex].subcategorias[subcategoriaIndex],
      [campo]: valor
    };
    setCategorias(nuevasCategorias);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validar campos requeridos
      if (!formData.nombre_empresa) {
        showAlert('error', 'Por favor ingresa el nombre de la empresa');
        return;
      }

      // Preparar datos con categorías
      const dataToSubmit: EmpresaFormData = {
        ...formData,
        categorias: categorias.map(cat => ({
          nombre: cat.nombre,
          descripcion: cat.descripcion,
          tipo_display: cat.tipo_display || 'horizontal',
          orden: cat.orden,
          subcategorias: cat.subcategorias.map(sub => ({
            nombre: sub.nombre,
            descripcion: sub.descripcion,
            imagen_url: sub.imagen_url,
            enlace_externo: sub.enlace_externo,
            orden: sub.orden
          }))
        }))
      };

      const result = await WebGeneratorService.createEmpresa(dataToSubmit);
      
      showAlert('success', `¡Empresa "${result.empresa.nombre_empresa}" creada exitosamente!`);
      showAlert('success', `Sitio web disponible en: /${result.empresa.slug_empresa}`);
      
      // Limpiar formulario
      setFormData({
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
      setCategorias([]);
      setActiveStep(1);

    } catch (error) {
      console.error('Error creating empresa:', error);
      showAlert('error', 'Error al crear la empresa. Por favor intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Actualizar vista previa de colores
  useEffect(() => {
    const previewHeader = document.getElementById('preview-header');
    const previewBtn = document.getElementById('preview-btn');
    const previewText = document.getElementById('preview-text');

    if (previewHeader) {
      previewHeader.style.background = `linear-gradient(135deg, ${formData.color_primario} 0%, ${formData.color_secundario} 100%)`;
    }

    if (previewBtn) {
      previewBtn.style.backgroundColor = formData.color_primario || '#2563eb';
    }

    if (previewText) {
      previewText.style.fontFamily = `'${formData.tipografia}', sans-serif`;
    }
  }, [formData.color_primario, formData.color_secundario, formData.tipografia]);

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-indigo-100 py-8">
        <div className="container mx-auto max-w-6xl px-4">
        <Card className="bg-white/95 backdrop-blur-sm shadow-2xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Globe className="h-12 w-12 text-blue-600" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-800">
              WebGenerator Pro
            </CardTitle>
            <CardDescription className="text-lg text-gray-600">
              Crea sitios web profesionales para cualquier tipo de negocio
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            {alert && (
              <Alert className={`${alert.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} mb-6`}>
                <AlertDescription className={alert.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                  {alert.message}
                </AlertDescription>
              </Alert>
            )}

            {/* Indicador de pasos */}
            <div className="flex justify-center mb-8">
              <div className="flex space-x-4">
                {[
                  { step: 1, title: 'Datos Básicos' },
                  { step: 2, title: 'Personalización' },
                  { step: 3, title: 'Contenido' },
                  { step: 4, title: 'Vista Previa' }
                ].map(({ step, title }) => (
                  <div key={step} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      activeStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                    }`}>
                      {step}
                    </div>
                    <span className="ml-2 text-sm font-medium text-gray-700">{title}</span>
                    {step < 4 && <div className="ml-4 w-8 h-px bg-gray-300"></div>}
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Paso 1: Datos Básicos */}
              {activeStep === 1 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Información Básica del Negocio</h3>
                    <p className="text-gray-600">Ingresa los datos principales de tu empresa</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="nombre_empresa" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        Nombre de la Empresa *
                      </Label>
                      <Input
                        id="nombre_empresa"
                        name="nombre_empresa"
                        value={formData.nombre_empresa}
                        onChange={handleInputChange}
                        placeholder="Ej: TechSolutions SA"
                        required
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tipo_negocio" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Tipo de Negocio
                      </Label>
                      <select
                        id="tipo_negocio"
                        name="tipo_negocio"
                        value={formData.tipo_negocio}
                        onChange={handleInputChange}
                        className="w-full h-11 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="descripcion_empresa" className="text-sm font-medium text-gray-700">
                        Descripción de la Empresa
                      </Label>
                      <textarea
                        id="descripcion_empresa"
                        name="descripcion_empresa"
                        value={formData.descripcion_empresa}
                        onChange={handleInputChange}
                        placeholder="Describe brevemente tu empresa, sus servicios o productos..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="hero_fondo_tipo" className="text-sm font-medium text-gray-700">
                        Tipo de fondo para sección principal
                      </Label>
                      <select
                        id="hero_fondo_tipo"
                        name="hero_fondo_tipo"
                        value={formData.hero_fondo_tipo || 'color'}
                        onChange={handleInputChange}
                        className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="color">Gradiente de color (por defecto)</option>
                        <option value="imagen">Imagen de fondo</option>
                      </select>
                    </div>

                    {formData.hero_fondo_tipo === 'imagen' && (
                      <div className="space-y-2">
                        <Label htmlFor="hero_imagen_fondo" className="text-sm font-medium text-gray-700">
                          URL de imagen para sección principal
                        </Label>
                        <Input
                          id="hero_imagen_fondo"
                          name="hero_imagen_fondo"
                          value={formData.hero_imagen_fondo || ''}
                          onChange={handleInputChange}
                          placeholder="https://ejemplo.com/mi-imagen.jpg"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-500">Para mejores resultados, usa imágenes de alta resolución</p>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor="descripcion_fondo_tipo" className="text-sm font-medium text-gray-700">
                        Tipo de fondo para descripción
                      </Label>
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
                        <Label htmlFor="descripcion_imagen_fondo" className="text-sm font-medium text-gray-700">
                          URL de la imagen de fondo
                        </Label>
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

                    <div className="space-y-2">
                      <Label htmlFor="correo_empresa" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Correo Electrónico
                      </Label>
                      <Input
                        id="correo_empresa"
                        name="correo_empresa"
                        type="email"
                        value={formData.correo_empresa}
                        onChange={handleInputChange}
                        placeholder="info@empresa.com"
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="telefono_empresa" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Teléfono
                      </Label>
                      <Input
                        id="telefono_empresa"
                        name="telefono_empresa"
                        value={formData.telefono_empresa}
                        onChange={handleInputChange}
                        placeholder="+1 234 567 890"
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="direccion_empresa" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Dirección
                      </Label>
                      <Input
                        id="direccion_empresa"
                        name="direccion_empresa"
                        value={formData.direccion_empresa}
                        onChange={handleInputChange}
                        placeholder="Calle Principal 123, Ciudad, País"
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dominio_deseado" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Dominio Deseado (opcional)
                      </Label>
                      <Input
                        id="dominio_deseado"
                        name="dominio_deseado"
                        value={formData.dominio_deseado}
                        onChange={handleInputChange}
                        placeholder="mi-empresa.com"
                        className="h-11"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button 
                      type="button"
                      onClick={() => setActiveStep(2)}
                      disabled={!formData.nombre_empresa}
                      className="px-6 py-2"
                    >
                      Siguiente: Personalización
                    </Button>
                  </div>
                </div>
              )}

              {/* Paso 2: Personalización */}
              {activeStep === 2 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Personalización Visual</h3>
                    <p className="text-gray-600">Customiza la apariencia de tu sitio web</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-800 flex items-center gap-2">
                          <Palette className="h-5 w-5" />
                          Colores y Tipografía
                        </h4>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="color_primario" className="text-sm font-medium text-gray-700">
                              Color Primario
                            </Label>
                            <div className="flex gap-2">
                              <Input
                                id="color_primario"
                                name="color_primario"
                                type="color"
                                value={formData.color_primario}
                                onChange={handleInputChange}
                                className="w-16 h-11 p-1"
                              />
                              <Input
                                value={formData.color_primario}
                                onChange={(e) => setFormData(prev => ({ ...prev, color_primario: e.target.value }))}
                                placeholder="#2563eb"
                                className="flex-1 h-11"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="color_secundario" className="text-sm font-medium text-gray-700">
                              Color Secundario
                            </Label>
                            <div className="flex gap-2">
                              <Input
                                id="color_secundario"
                                name="color_secundario"
                                type="color"
                                value={formData.color_secundario}
                                onChange={handleInputChange}
                                className="w-16 h-11 p-1"
                              />
                              <Input
                                value={formData.color_secundario}
                                onChange={(e) => setFormData(prev => ({ ...prev, color_secundario: e.target.value }))}
                                placeholder="#1e40af"
                                className="flex-1 h-11"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="tipografia" className="text-sm font-medium text-gray-700">
                            Tipografía
                          </Label>
                          <select
                            id="tipografia"
                            name="tipografia"
                            value={formData.tipografia}
                            onChange={handleInputChange}
                            className="w-full h-11 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="Inter">Inter (Moderno)</option>
                            <option value="Roboto">Roboto (Universal)</option>
                            <option value="Poppins">Poppins (Amigable)</option>
                            <option value="Open Sans">Open Sans (Legible)</option>
                            <option value="Montserrat">Montserrat (Elegante)</option>
                            <option value="Lato">Lato (Profesional)</option>
                          </select>
                        </div>

                        <div className="space-y-4">
                          <h5 className="font-medium text-gray-800 flex items-center gap-2">
                            <Image className="h-4 w-4" />
                            Imágenes
                          </h5>

                          <div className="space-y-2">
                            <Label htmlFor="logo_url" className="text-sm font-medium text-gray-700">
                              URL del Logo
                            </Label>
                            <div className="flex gap-2">
                              <Input
                                id="logo_url"
                                name="logo_url"
                                value={formData.logo_url}
                                onChange={handleInputChange}
                                placeholder="https://ejemplo.com/logo.png o URL de Google Drive"
                                className="flex-1 h-11"
                              />
                              {formData.logo_url && formData.logo_url.includes('drive.google.com') && (
                                <p className="text-xs text-green-600 mt-1">
                                  Enlace de Google Drive detectado, se convertirá automáticamente
                                </p>
                              )}
                              {formData.logo_url && !formData.logo_url.includes('placeholder') && (
                                <div className="mt-2">
                                  <img 
                                    src={formData.logo_url.includes('drive.google.com') ? 
                                      formatGoogleDriveUrl(formData.logo_url) : 
                                      formData.logo_url} 
                                    alt="Vista previa del logo" 
                                    className="h-16 object-contain rounded border"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = "https://placehold.co/400x300?text=Logo+no+disponible";
                                    }}
                                  />
                                </div>
                              )}
                              <Button
                                type="button"
                                variant="outline"
                                onClick={setExampleLogo}
                                className="h-11"
                              >
                                Ejemplo
                              </Button>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="video_promocional_url" className="text-sm font-medium text-gray-700">
                              Video Promocional (opcional)
                            </Label>
                            <Input
                              id="video_promocional_url"
                              name="video_promocional_url"
                              value={formData.video_promocional_url}
                              onChange={handleInputChange}
                              placeholder="https://youtube.com/watch?v=..."
                              className="h-11"
                            />
                            
                            {formData.video_promocional_url && (
                              <div className="mt-3">
                                <Label htmlFor="video_descripcion" className="text-sm font-medium text-gray-700">
                                  Descripción del Video
                                </Label>
                                <textarea
                                  id="video_descripcion"
                                  name="video_descripcion"
                                  value={formData.video_descripcion || ''}
                                  onChange={handleInputChange}
                                  placeholder="Describe brevemente el contenido del video"
                                  rows={2}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <p className="text-xs text-gray-500">
                                  Este texto se mostrará junto al video en lugar de la descripción general
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Vista previa */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-800">Vista Previa</h4>
                      <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
                        <div 
                          id="preview-header" 
                          className="h-20 flex items-center justify-center text-white font-semibold"
                          style={{ 
                            background: `linear-gradient(135deg, ${formData.color_primario} 0%, ${formData.color_secundario} 100%)`,
                            fontFamily: `'${formData.tipografia}', sans-serif`
                          }}
                        >
                          {formData.nombre_empresa || 'Nombre de Empresa'}
                        </div>
                        <div className="p-6 space-y-4">
                          <div 
                            id="preview-text"
                            className="text-gray-700"
                            style={{ fontFamily: `'${formData.tipografia}', sans-serif` }}
                          >
                            {formData.descripcion_empresa || 'Descripción de la empresa aparecerá aquí...'}
                          </div>
                          <button
                            id="preview-btn"
                            className="px-6 py-2 text-white rounded-lg"
                            style={{ backgroundColor: formData.color_primario }}
                          >
                            Botón de Ejemplo
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={() => setActiveStep(1)}
                      className="px-6 py-2"
                    >
                      Anterior
                    </Button>
                    <Button 
                      type="button"
                      onClick={() => setActiveStep(3)}
                      className="px-6 py-2"
                    >
                      Siguiente: Contenido
                    </Button>
                  </div>
                </div>
              )}

              {/* Paso 3: Contenido (Categorías y Subcategorías) */}
              {activeStep === 3 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Organización del Contenido</h3>
                    <p className="text-gray-600">Define las categorías y subcategorías de tu sitio web</p>
                  </div>

                  <div className="space-y-6">
                    {categorias.map((categoria, categoriaIndex) => (
                      <Card key={categoriaIndex} className="border-l-4 border-blue-500 shadow-md bg-blue-50/50">
                        <CardHeader className="pb-4 bg-gradient-to-r from-blue-600 to-blue-400 text-white">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge className="bg-white text-blue-700">{categoriaIndex + 1}</Badge>
                              <span className="font-medium">Categoría: {categoria.nombre || 'Sin nombre'}</span>
                              <div className="flex gap-1">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => moverCategoria(categoriaIndex, 'up')}
                                  disabled={categoriaIndex === 0}
                                >
                                  <ArrowUp className="h-4 w-4" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => moverCategoria(categoriaIndex, 'down')}
                                  disabled={categoriaIndex === categorias.length - 1}
                                >
                                  <ArrowDown className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => eliminarCategoria(categoriaIndex)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-gray-700">Nombre de la Categoría</Label>
                              <Input
                                value={categoria.nombre}
                                onChange={(e) => actualizarCategoria(categoriaIndex, 'nombre', e.target.value)}
                                placeholder="Ej: Servicios"
                                className="h-10"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-gray-700">Descripción</Label>
                              <Input
                                value={categoria.descripcion}
                                onChange={(e) => actualizarCategoria(categoriaIndex, 'descripcion', e.target.value)}
                                placeholder="Descripción breve de la categoría"
                                className="h-10"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-gray-700">Tipo de Visualización</Label>
                              <select
                                value={categoria.tipo_display || 'horizontal'}
                                onChange={(e) => actualizarCategoria(categoriaIndex, 'tipo_display', e.target.value)}
                                className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="horizontal">Horizontal (Por defecto)</option>
                                <option value="vertical">Vertical</option>
                              </select>
                              <p className="text-xs text-gray-500 mt-1">Define cómo se mostrarán las subcategorías</p>
                            </div>
                          </div>

                          {/* Subcategorías */}
                          <div className="space-y-4 mt-6 pt-4 border-t border-blue-100">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center bg-blue-100 rounded-md px-3 py-2 text-blue-800">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 mr-2">
                                  <path d="M9 18h6"></path>
                                  <path d="M12 22V9"></path>
                                  <circle cx="12" cy="6" r="3"></circle>
                                </svg>
                                <h5 className="font-medium">Subcategorías de <strong>"{categoria.nombre || 'esta categoría'}"</strong></h5>
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="bg-cyan-50 border-cyan-200 hover:bg-cyan-100 text-cyan-700 flex items-center gap-1"
                                onClick={() => agregarSubcategoria(categoriaIndex)}
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Agregar Subcategoría
                              </Button>
                            </div>
                            <div className="ml-3 mb-3 bg-blue-50 p-2 rounded-lg border border-blue-100">
                              <p className="text-xs text-blue-700">Las subcategorías se mostrarán dentro de <strong>"{categoria.nombre || 'esta categoría'}"</strong> en el sitio web.</p>
                            </div>

                            {categoria.subcategorias.map((subcategoria, subcategoriaIndex) => (
                              <div key={subcategoriaIndex} className="border rounded-lg p-4 bg-cyan-50 border-l-4 border-cyan-500 ml-3 relative shadow-sm">
                                {/* Línea conectora e indicador visual */}
                                <div className="absolute -left-3 top-1/2 w-3 h-0.5 bg-cyan-500"></div>
                                <div className="absolute -left-5 top-1/2 transform -translate-y-1/2 w-3 h-3 rounded-full bg-cyan-500 border-2 border-white"></div>
                                
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center">
                                    <Badge className="bg-cyan-100 text-cyan-800 hover:bg-cyan-200">Subcategoría {subcategoriaIndex + 1}</Badge>
                                    <span className="ml-2 text-xs text-cyan-700">de {categoria.nombre || 'Categoría principal'}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    {/* Botones de reordenamiento para subcategorías */}
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        const newCategorias = [...categorias];
                                        if (subcategoriaIndex > 0) {
                                          const temp = newCategorias[categoriaIndex].subcategorias[subcategoriaIndex];
                                          newCategorias[categoriaIndex].subcategorias[subcategoriaIndex] = newCategorias[categoriaIndex].subcategorias[subcategoriaIndex - 1];
                                          newCategorias[categoriaIndex].subcategorias[subcategoriaIndex - 1] = temp;
                                          setCategorias(newCategorias);
                                        }
                                      }}
                                      disabled={subcategoriaIndex === 0}
                                      className="h-8 w-8 p-0"
                                    >
                                      <ArrowUp className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        const newCategorias = [...categorias];
                                        if (subcategoriaIndex < categoria.subcategorias.length - 1) {
                                          const temp = newCategorias[categoriaIndex].subcategorias[subcategoriaIndex];
                                          newCategorias[categoriaIndex].subcategorias[subcategoriaIndex] = newCategorias[categoriaIndex].subcategorias[subcategoriaIndex + 1];
                                          newCategorias[categoriaIndex].subcategorias[subcategoriaIndex + 1] = temp;
                                          setCategorias(newCategorias);
                                        }
                                      }}
                                      disabled={subcategoriaIndex === categoria.subcategorias.length - 1}
                                      className="h-8 w-8 p-0"
                                    >
                                      <ArrowDown className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => eliminarSubcategoria(categoriaIndex, subcategoriaIndex)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <div className="space-y-1">
                                    <Label className="text-xs font-medium text-gray-600">Nombre</Label>
                                    <Input
                                      value={subcategoria.nombre}
                                      onChange={(e) => actualizarSubcategoria(categoriaIndex, subcategoriaIndex, 'nombre', e.target.value)}
                                      placeholder="Ej: Consultoría"
                                      className="h-9 text-sm"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-xs font-medium text-gray-600">Descripción</Label>
                                    <Input
                                      value={subcategoria.descripcion}
                                      onChange={(e) => actualizarSubcategoria(categoriaIndex, subcategoriaIndex, 'descripcion', e.target.value)}
                                      placeholder="Descripción de la subcategoría"
                                      className="h-9 text-sm"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-xs font-medium text-gray-600">URL de Imagen</Label>
                                    <Input
                                      value={subcategoria.imagen_url}
                                      onChange={(e) => actualizarSubcategoria(categoriaIndex, subcategoriaIndex, 'imagen_url', e.target.value)}
                                      placeholder="https://ejemplo.com/imagen.jpg"
                                      className="h-9 text-sm"
                                    />
                                    {subcategoria.imagen_url && subcategoria.imagen_url.includes('drive.google.com') && (
                                      <p className="text-xs text-green-600 mt-1">
                                        Enlace de Google Drive detectado, se convertirá automáticamente
                                      </p>
                                    )}
                                    {subcategoria.imagen_url && (
                                      <div className="mt-2">
                                        <img 
                                          src={subcategoria.imagen_url.includes('drive.google.com') ? 
                                            formatGoogleDriveUrl(subcategoria.imagen_url) : 
                                            subcategoria.imagen_url} 
                                          alt="Vista previa" 
                                          className="h-16 object-contain rounded border"
                                          onError={(e) => {
                                            console.error("Error cargando imagen en generador:", e);
                                            (e.target as HTMLImageElement).src = "https://placehold.co/400x300?text=Imagen+no+disponible";
                                          }}
                                          crossOrigin="anonymous"
                                        />
                                      </div>
                                    )}
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-xs font-medium text-gray-600">Enlace Externo</Label>
                                    <Input
                                      value={subcategoria.enlace_externo}
                                      onChange={(e) => actualizarSubcategoria(categoriaIndex, subcategoriaIndex, 'enlace_externo', e.target.value)}
                                      placeholder="https://ejemplo.com"
                                      className="h-9 text-sm"
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    <div className="text-center">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={agregarCategoria}
                        className="px-6 py-2"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar Categoría
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={() => setActiveStep(2)}
                      className="px-6 py-2"
                    >
                      Anterior
                    </Button>
                    <Button 
                      type="button"
                      onClick={() => setActiveStep(4)}
                      className="px-6 py-2"
                    >
                      Ver Vista Previa
                    </Button>
                  </div>
                </div>
              )}

              {/* Paso 4: Vista Previa y Confirmación */}
              {activeStep === 4 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Vista Previa y Confirmación</h3>
                    <p className="text-gray-600">Revisa todos los datos antes de crear tu sitio web</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Resumen de datos */}
                    <div className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Información de la Empresa</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <strong>Nombre:</strong> {formData.nombre_empresa}
                          </div>
                          <div>
                            <strong>Tipo:</strong> {formData.tipo_negocio || 'No especificado'}
                          </div>
                          <div>
                            <strong>Email:</strong> {formData.correo_empresa || 'No especificado'}
                          </div>
                          <div>
                            <strong>Teléfono:</strong> {formData.telefono_empresa || 'No especificado'}
                          </div>
                          {formData.descripcion_empresa && (
                            <div>
                              <strong>Descripción:</strong> {formData.descripcion_empresa}
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Personalización</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center gap-3">
                            <strong>Colores:</strong>
                            <div className="flex gap-2">
                              <div 
                                className="w-6 h-6 rounded border"
                                style={{ backgroundColor: formData.color_primario }}
                                title="Color Primario"
                              ></div>
                              <div 
                                className="w-6 h-6 rounded border"
                                style={{ backgroundColor: formData.color_secundario }}
                                title="Color Secundario"
                              ></div>
                            </div>
                          </div>
                          <div>
                            <strong>Tipografía:</strong> {formData.tipografia}
                          </div>
                        </CardContent>
                      </Card>

                      {categorias.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Categorías ({categorias.length})</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {categorias.map((categoria, index) => (
                              <div key={index} className="border-l-2 border-blue-500 pl-3">
                                <div className="font-medium">{categoria.nombre}</div>
                                {categoria.descripcion && (
                                  <div className="text-sm text-gray-600">{categoria.descripcion}</div>
                                )}
                                {categoria.subcategorias.length > 0 && (
                                  <div className="text-sm text-blue-600 mt-1">
                                    {categoria.subcategorias.length} subcategorías
                                  </div>
                                )}
                              </div>
                            ))}
                          </CardContent>
                        </Card>
                      )}
                    </div>

                    {/* Vista previa del sitio */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-800">Vista Previa del Sitio</h4>
                      <div className="border rounded-lg overflow-hidden bg-white shadow-lg">
                        <div 
                          className="h-16 flex items-center justify-between px-6 text-white font-semibold"
                          style={{ 
                            background: `linear-gradient(135deg, ${formData.color_primario} 0%, ${formData.color_secundario} 100%)`,
                            fontFamily: `'${formData.tipografia}', sans-serif`
                          }}
                        >
                          <div>{formData.nombre_empresa}</div>
                          {formData.logo_url && (
                            <img src={formData.logo_url} alt="Logo" className="h-8 w-auto" />
                          )}
                        </div>
                        <div className="p-6 space-y-4">
                          <div 
                            className="text-lg font-semibold"
                            style={{ fontFamily: `'${formData.tipografia}', sans-serif` }}
                          >
                            Bienvenido a {formData.nombre_empresa}
                          </div>
                          <div 
                            className="text-gray-700 p-3 rounded-md"
                            style={{ 
                              fontFamily: `'${formData.tipografia}', sans-serif`,
                              background: formData.descripcion_fondo_tipo === 'imagen' && formData.descripcion_imagen_fondo 
                                ? `url(${formData.descripcion_imagen_fondo}) center/cover no-repeat` 
                                : `linear-gradient(135deg, ${formData.color_primario}33, ${formData.color_secundario}33)`,
                              textShadow: formData.descripcion_fondo_tipo === 'imagen' ? '0 0 5px rgba(255, 255, 255, 0.8)' : 'none',
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                              border: '1px solid #e5e7eb'
                            }}
                          >
                            {formData.descripcion_empresa || 'Descripción de la empresa...'}
                          </div>
                          {categorias.length > 0 && (
                            <div className="space-y-2">
                              <div className="font-medium text-gray-800">Nuestros Servicios:</div>
                              <div className="space-y-1">
                                {categorias.slice(0, 3).map((categoria, index) => (
                                  <div key={index} className="text-sm text-blue-600">
                                    • {categoria.nombre}
                                  </div>
                                ))}
                                {categorias.length > 3 && (
                                  <div className="text-sm text-gray-500">
                                    y {categorias.length - 3} más...
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                          <button
                            className="px-6 py-2 text-white rounded-lg"
                            style={{ backgroundColor: formData.color_primario }}
                          >
                            Contáctanos
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={() => setActiveStep(3)}
                      className="px-6 py-2"
                    >
                      Anterior
                    </Button>
                    <Button 
                      type="submit"
                      disabled={isLoading}
                      className="px-8 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      {isLoading ? 'Creando sitio web...' : 'Crear Sitio Web'}
                    </Button>
                  </div>
                </div>
              )}

            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <p className="text-gray-600">
            ¿Necesitas ayuda? <Link href="/ayuda" className="text-blue-600 hover:underline">Consulta nuestra guía</Link>
          </p>
        </div>
      </div>
    </div>
    </>
  );
}
