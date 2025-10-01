'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { EmpresaFormData } from '@/lib/types/webgenerator';
import { WebGeneratorService } from '@/lib/services/webgenerator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import RichTextEditor from '@/components/ui/rich-text-editor';
import { Globe, Palette, Building, Users, Phone, Mail, MapPin, Image, Plus, Trash2, ArrowUp, ArrowDown, Package } from 'lucide-react';
import Link from 'next/link';
import { GeneratorHeader } from '@/components/generator-header';
// La migración ya se ha completado

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
  fondo_tipo?: 'color' | 'imagen';
  fondo_color?: string;
  fondo_imagen?: string;
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
  const router = useRouter();
  const [formData, setFormData] = useState<EmpresaFormData>({
    nombre_empresa: '',
    descripcion_empresa: '',
    hero_fondo_tipo: 'color',
    hero_imagen_fondo: '',
    descripcion_fondo_tipo: 'color',
    descripcion_imagen_fondo: '',
    video_descripcion: '',
    // Campo para sucursales/ubicaciones
    sucursales_activo: false,
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
  const [productos, setProductos] = useState<Array<{
    nombre: string;
    descripcion: string;
    precio: number;
    precio_descuento?: number;
    categoria_nombre: string;
    subcategoria_nombre?: string;
    imagen_url?: string;
    disponible: boolean;
    orden: number;
  }>>([]);
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
      fondo_tipo: 'color',
      fondo_color: '#ffffff',
      fondo_imagen: '',
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

  // Funciones para manejar productos
  const agregarProducto = () => {
    const nuevoProducto = {
      nombre: '',
      descripcion: '',
      precio: 0,
      categoria_nombre: categorias.length > 0 ? categorias[0].nombre : '',
      subcategoria_nombre: '',
      imagen_url: '',
      disponible: true,
      orden: productos.length
    };
    setProductos([...productos, nuevoProducto]);
  };

  const eliminarProducto = (index: number) => {
    setProductos(productos.filter((_, i) => i !== index));
  };

  const actualizarProducto = (index: number, campo: string, valor: any) => {
    setProductos(productos.map((prod, i) => 
      i === index ? { ...prod, [campo]: valor } : prod
    ));
  };

  const moverProducto = (index: number, direccion: 'up' | 'down') => {
    const newProductos = [...productos];
    const newIndex = direccion === 'up' ? index - 1 : index + 1;
    
    if (newIndex >= 0 && newIndex < productos.length) {
      [newProductos[index], newProductos[newIndex]] = [newProductos[newIndex], newProductos[index]];
      
      // Actualizar órdenes
      newProductos.forEach((prod, i) => {
        prod.orden = i;
      });
      
      setProductos(newProductos);
    }
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

      // Ya no necesitamos eliminar estos campos porque la migración ya se completó
      const formDataLimpio = { ...formData };
      
      // Preparar datos con categorías y productos
      const dataToSubmit: EmpresaFormData = {
        ...formDataLimpio,
        categorias: categorias.map(cat => ({
          nombre: cat.nombre,
          descripcion: cat.descripcion,
          tipo_display: cat.tipo_display || 'horizontal',
          orden: cat.orden,
          fondo_tipo: cat.fondo_tipo || 'color',
          fondo_color: cat.fondo_color || '#ffffff',
          fondo_imagen: cat.fondo_imagen || '',
          subcategorias: cat.subcategorias.map(sub => ({
            nombre: sub.nombre,
            descripcion: sub.descripcion,
            imagen_url: sub.imagen_url,
            enlace_externo: sub.enlace_externo,
            orden: sub.orden
          }))
        })),
        productos: productos.map(prod => ({
          nombre: prod.nombre,
          descripcion: prod.descripcion,
          precio: prod.precio,
          precio_descuento: prod.precio_descuento,
          categoria_nombre: prod.categoria_nombre,
          subcategoria_nombre: prod.subcategoria_nombre,
          imagen_url: prod.imagen_url,
          disponible: prod.disponible,
          orden: prod.orden
        }))
      };

      const result = await WebGeneratorService.createEmpresa(dataToSubmit);
      
      showAlert('success', `¡Empresa "${result.empresa.nombre_empresa}" creada exitosamente!`);
      showAlert('success', `Sitio web disponible en: /${result.empresa.slug_empresa}`);
      
      // Redireccionar después de un breve delay para mostrar el mensaje
      setTimeout(async () => {
        try {
          // Verificar el rol del usuario para determinar dónde redireccionar
          const authResponse = await fetch('/api/admin/auth');
          const authResult = await authResponse.json();

          if (authResult.success) {
            const user = authResult.user;
            
            // Redireccionar según el tipo de usuario
            if (user.role === 1) {
              // Superadministrador - volver a administrar empresas
              router.push('/admin/empresas');
            } else if (user.role === 2) {
              // Administrador - ir a su dashboard específico si tiene empresa asignada
              if (user.empresaId) {
                router.push(`/dashboard-admin/${user.empresaId}`);
              } else {
                router.push('/admin/empresas');
              }
            } else {
              // Usuario normal - ir al sitio creado
              router.push(`/${result.empresa.slug_empresa}`);
            }
          } else {
            // Sin autenticación - ir al sitio creado
            router.push(`/${result.empresa.slug_empresa}`);
          }
        } catch (error) {
          console.error('Error en redirección:', error);
          // Fallback: ir al sitio creado
          router.push(`/${result.empresa.slug_empresa}`);
        }
      }, 2000);
      
      // Limpiar formulario
      setFormData({
        nombre_empresa: '',
        descripcion_empresa: '',
        hero_fondo_tipo: 'color',
        hero_imagen_fondo: '',
        descripcion_fondo_tipo: 'color',
        descripcion_imagen_fondo: '',
        video_descripcion: '',
        // Campo para sucursales/ubicaciones
        sucursales_activo: false,
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
      <GeneratorHeader />
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
                  { step: 4, title: 'Productos' },
                  { step: 5, title: 'Vista Previa' }
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

                    {/* Descripción de la empresa */}
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="descripcion_empresa" className="text-sm font-medium text-gray-700">
                        Descripción de la Empresa
                      </Label>
                      <RichTextEditor
                        value={formData.descripcion_empresa || ''}
                        onChange={(content) => setFormData(prev => ({ ...prev, descripcion_empresa: content }))}
                        placeholder="Describe brevemente tu empresa, sus servicios o productos..."
                      />
                    </div>

                    {/* Personalización del Hero/Banner */}
                    <div className="space-y-2 md:col-span-2 border-t pt-4 border-gray-200 mt-2">
                      <h3 className="text-md font-medium mb-2">🎨 Personalizar sección principal (Hero/Banner)</h3>
                      
                      <div className="space-y-2">
                        <Label htmlFor="hero_fondo_tipo" className="text-sm font-medium text-gray-700">
                          Tipo de fondo para el banner principal
                        </Label>
                        <select
                          id="hero_fondo_tipo"
                          name="hero_fondo_tipo"
                          value={formData.hero_fondo_tipo || 'color'}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="color">Color sólido (gradiente)</option>
                          <option value="imagen">Imagen de fondo</option>
                        </select>
                      </div>
                      
                      {formData.hero_fondo_tipo === 'imagen' && (
                        <div className="space-y-2">
                          <Label htmlFor="hero_imagen_fondo" className="text-sm font-medium text-gray-700">
                            URL de la imagen de fondo para el banner
                          </Label>
                          <Input
                            id="hero_imagen_fondo"
                            name="hero_imagen_fondo"
                            value={formData.hero_imagen_fondo || ''}
                            onChange={handleInputChange}
                            placeholder="https://example.com/imagen.jpg"
                            className="w-full"
                          />
                          <p className="text-xs text-gray-500">
                            Recomendado: Imagen horizontal de al menos 1920x1080px
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Personalización de la sección de descripción */}
                    <div className="space-y-2 md:col-span-2 border-t pt-4 border-gray-200 mt-2">
                      <h3 className="text-md font-medium mb-2">🖼️ Personalizar sección de descripción</h3>
                    
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
                    </div>

                    {/* Modal de Ventana Flotante */}
                    <div className="space-y-2 md:col-span-2 border-t pt-4 border-gray-200 mt-2">
                      <h3 className="text-md font-medium mb-2">� Ventana Flotante de Bienvenida</h3>
                      
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="modal_activo"
                            name="modal_activo"
                            // TEMPORALMENTE COMENTADO - ventana flotante se maneja por separado
                            // checked={formData.modal_activo || false}
                            // onChange={(e) => setFormData(prev => ({ ...prev, modal_activo: e.target.checked }))}
                            checked={false}
                            onChange={() => {}}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <Label htmlFor="modal_activo" className="text-sm font-medium text-gray-700">
                            Activar ventana flotante de bienvenida
                          </Label>
                        </div>
                        <p className="text-xs text-gray-500">
                          Se mostrará una ventana flotante cada vez que alguien visite la página
                        </p>
                      </div>

                      {/* TEMPORALMENTE COMENTADO - ventana flotante se maneja por separado
                      {formData.modal_activo && (
                      */}
                      {false && (
                        <div className="space-y-4 mt-4 p-4 bg-gray-50 rounded-lg">
                          {/* Título del modal */}
                          <div className="space-y-2">
                            <Label htmlFor="modal_titulo" className="text-sm font-medium text-gray-700">
                              Título de la ventana
                            </Label>
                            <Input
                              id="modal_titulo"
                              name="modal_titulo"
                              value={'' /* formData.modal_titulo || '' */}
                              onChange={handleInputChange}
                              placeholder="Ej: ¡Bienvenido! o Información importante"
                              className="w-full"
                            />
                          </div>

                          {/* Mensaje del modal */}
                          <div className="space-y-2">
                            <Label htmlFor="modal_mensaje" className="text-sm font-medium text-gray-700">
                              Mensaje de la ventana
                            </Label>
                            <textarea
                              id="modal_mensaje"
                              name="modal_mensaje"
                              value={'' /* formData.modal_mensaje || '' */}
                              onChange={handleInputChange}
                              placeholder="Escribe tu mensaje de bienvenida, información importante o promoción..."
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          {/* Imagen del modal */}
                          <div className="space-y-2">
                            <Label htmlFor="modal_imagen_url" className="text-sm font-medium text-gray-700">
                              URL de imagen (opcional)
                            </Label>
                            <Input
                              id="modal_imagen_url"
                              name="modal_imagen_url"
                              value={'' /* formData.modal_imagen_url || '' */}
                              onChange={handleInputChange}
                              placeholder="https://ejemplo.com/imagen.jpg"
                              className="w-full"
                            />
                            <p className="text-xs text-gray-500">
                              Imagen que aparecerá en el modal (tamaño máximo: 300px de alto)
                            </p>
                          </div>

                          {/* Tipo de fondo */}
                          <div className="space-y-2">
                            <Label htmlFor="modal_fondo_tipo" className="text-sm font-medium text-gray-700">
                              Tipo de fondo de la ventana
                            </Label>
                            <select
                              id="modal_fondo_tipo"
                              name="modal_fondo_tipo"
                              value={'color' /* formData.modal_fondo_tipo || 'color' */}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="color">Color sólido</option>
                              <option value="imagen">Imagen de fondo</option>
                            </select>
                          </div>

                          {/* Color de fondo */}
                          {false /* formData.modal_fondo_tipo === 'color' */ && (
                            <div className="space-y-2">
                              <Label htmlFor="modal_fondo_color" className="text-sm font-medium text-gray-700">
                                Color de fondo
                              </Label>
                              <Input
                                id="modal_fondo_color"
                                name="modal_fondo_color"
                                type="color"
                                value={'#ffffff' /* formData.modal_fondo_color || '#ffffff' */}
                                onChange={handleInputChange}
                                className="w-20 h-10"
                              />
                            </div>
                          )}

                          {/* Imagen de fondo */}
                          {false /* formData.modal_fondo_tipo === 'imagen' */ && (
                            <div className="space-y-2">
                              <Label htmlFor="modal_fondo_imagen" className="text-sm font-medium text-gray-700">
                                URL de imagen de fondo
                              </Label>
                              <Input
                                id="modal_fondo_imagen"
                                name="modal_fondo_imagen"
                                value={'' /* formData.modal_fondo_imagen || '' */}
                                onChange={handleInputChange}
                                placeholder="https://ejemplo.com/fondo.jpg"
                                className="w-full"
                              />
                              <p className="text-xs text-gray-500">
                                Se aplicará una capa semi-transparente para mejorar la legibilidad
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Sucursales/Ubicaciones */}
                    <div className="space-y-2 md:col-span-2 border-t pt-4 border-gray-200 mt-2">
                      <h3 className="text-md font-medium mb-2">📍 Sucursales y Ubicaciones</h3>
                      
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="sucursales_activo"
                            name="sucursales_activo"
                            checked={formData.sucursales_activo || false}
                            onChange={(e) => setFormData(prev => ({ ...prev, sucursales_activo: e.target.checked }))}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <Label htmlFor="sucursales_activo" className="text-sm font-medium text-gray-700">
                            Mostrar sección de sucursales/ubicaciones
                          </Label>
                        </div>
                        <p className="text-xs text-gray-500">
                          Agregar múltiples ubicaciones con mapas para que los clientes encuentren tus sucursales
                        </p>
                      </div>
                    </div>

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
                                <RichTextEditor
                                  value={formData.video_descripcion || ''}
                                  onChange={(content) => setFormData(prev => ({ ...prev, video_descripcion: content }))}
                                  placeholder="Describe brevemente el contenido del video"
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
                          className="h-20 flex items-center justify-center text-white font-semibold relative overflow-hidden"
                          style={{ 
                            background: formData.hero_fondo_tipo === 'imagen' && formData.hero_imagen_fondo
                              ? `url("${formData.hero_imagen_fondo}") center/cover no-repeat`
                              : `linear-gradient(135deg, ${formData.color_primario} 0%, ${formData.color_secundario} 100%)`,
                            fontFamily: `'${formData.tipografia}', sans-serif`
                          }}
                        >
                          {formData.hero_fondo_tipo === 'imagen' && formData.hero_imagen_fondo && (
                            <div className="absolute inset-0 bg-black/20"></div>
                          )}
                          <span className="relative z-10">
                            {formData.nombre_empresa || 'Nombre de Empresa'}
                          </span>
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

                          {/* Personalización de Fondo */}
                          <div className="space-y-4 mt-6 pt-4 border-t border-green-100">
                            <div className="flex items-center bg-green-100 rounded-md px-3 py-2 text-green-800 mb-4">
                              <Palette className="text-green-600 mr-2 h-4 w-4" />
                              <h5 className="font-medium">Personalización de Fondo</h5>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">Tipo de Fondo</Label>
                                <select
                                  value={categoria.fondo_tipo || 'color'}
                                  onChange={(e) => actualizarCategoria(categoriaIndex, 'fondo_tipo', e.target.value)}
                                  className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                >
                                  <option value="color">Color Sólido</option>
                                  <option value="imagen">Imagen de Fondo</option>
                                </select>
                              </div>
                              
                              {categoria.fondo_tipo === 'color' ? (
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium text-gray-700">Color de Fondo</Label>
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="color"
                                      value={categoria.fondo_color || '#ffffff'}
                                      onChange={(e) => actualizarCategoria(categoriaIndex, 'fondo_color', e.target.value)}
                                      className="w-12 h-10 border border-gray-300 rounded-md cursor-pointer"
                                    />
                                    <Input
                                      value={categoria.fondo_color || '#ffffff'}
                                      onChange={(e) => actualizarCategoria(categoriaIndex, 'fondo_color', e.target.value)}
                                      placeholder="#ffffff"
                                      className="h-10 flex-1"
                                    />
                                  </div>
                                  <p className="text-xs text-gray-500">Color hexadecimal para el fondo de la categoría</p>
                                </div>
                              ) : (
                                <div className="space-y-2 md:col-span-2">
                                  <Label className="text-sm font-medium text-gray-700">URL de Imagen de Fondo</Label>
                                  <Input
                                    value={categoria.fondo_imagen || ''}
                                    onChange={(e) => actualizarCategoria(categoriaIndex, 'fondo_imagen', e.target.value)}
                                    placeholder="https://ejemplo.com/imagen.jpg"
                                    className="h-10"
                                  />
                                  <p className="text-xs text-gray-500">URL de la imagen que se usará como fondo de la categoría</p>
                                </div>
                              )}
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
                                    <RichTextEditor
                                      value={subcategoria.nombre}
                                      onChange={(content) => actualizarSubcategoria(categoriaIndex, subcategoriaIndex, 'nombre', content)}
                                      placeholder="Ej: Consultoría"
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
                      Siguiente: Productos
                    </Button>
                  </div>
                </div>
              )}

              {/* Paso 4: Productos */}
              {activeStep === 4 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Productos</h3>
                    <p className="text-gray-600">Añade productos a tu catálogo (opcional)</p>
                  </div>

                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Package className="h-5 w-5 text-blue-600" />
                          Catálogo de Productos
                        </CardTitle>
                        <CardDescription>
                          Puedes añadir productos ahora o más tarde desde el panel de administración
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {productos.map((producto, index) => (
                          <Card key={index} className="p-4 border-l-4 border-l-blue-500">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor={`producto-nombre-${index}`}>Nombre del producto *</Label>
                                <Input
                                  id={`producto-nombre-${index}`}
                                  value={producto.nombre}
                                  onChange={(e) => actualizarProducto(index, 'nombre', e.target.value)}
                                  placeholder="Ej: Hamburguesa clásica"
                                />
                              </div>
                              
                              <div>
                                <Label htmlFor={`producto-precio-${index}`}>Precio *</Label>
                                <Input
                                  id={`producto-precio-${index}`}
                                  type="number"
                                  step="0.01"
                                  value={producto.precio}
                                  onChange={(e) => actualizarProducto(index, 'precio', parseFloat(e.target.value))}
                                  placeholder="0.00"
                                />
                              </div>
                              
                              <div className="md:col-span-2">
                                <Label htmlFor={`producto-descripcion-${index}`}>Descripción</Label>
                                <RichTextEditor
                                  value={producto.descripcion}
                                  onChange={(content) => actualizarProducto(index, 'descripcion', content)}
                                  placeholder="Describe tu producto..."
                                />
                              </div>
                              
                              <div>
                                <Label htmlFor={`producto-categoria-${index}`}>Categoría</Label>
                                <select
                                  id={`producto-categoria-${index}`}
                                  value={producto.categoria_nombre}
                                  onChange={(e) => actualizarProducto(index, 'categoria_nombre', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                  <option value="">Sin categoría</option>
                                  {categorias.map((cat, catIndex) => (
                                    <option key={catIndex} value={cat.nombre}>
                                      {cat.nombre}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              
                              <div>
                                <Label htmlFor={`producto-imagen-${index}`}>URL de imagen</Label>
                                <Input
                                  id={`producto-imagen-${index}`}
                                  value={producto.imagen_url || ''}
                                  onChange={(e) => actualizarProducto(index, 'imagen_url', e.target.value)}
                                  placeholder="https://ejemplo.com/imagen.jpg"
                                />
                              </div>
                            </div>
                            
                            <div className="flex justify-between items-center mt-4 pt-4 border-t">
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id={`producto-disponible-${index}`}
                                  checked={producto.disponible}
                                  onChange={(e) => actualizarProducto(index, 'disponible', e.target.checked)}
                                  className="rounded border-gray-300"
                                />
                                <Label htmlFor={`producto-disponible-${index}`}>Disponible</Label>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                {index > 0 && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => moverProducto(index, 'up')}
                                  >
                                    <ArrowUp className="h-4 w-4" />
                                  </Button>
                                )}
                                {index < productos.length - 1 && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => moverProducto(index, 'down')}
                                  >
                                    <ArrowDown className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => eliminarProducto(index)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </Card>
                        ))}
                        
                        <div className="text-center">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={agregarProducto}
                            className="px-6 py-2"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Agregar Producto
                          </Button>
                        </div>
                        
                        {productos.length === 0 && (
                          <div className="text-center py-8 text-gray-500">
                            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No hay productos añadidos aún</p>
                            <p className="text-sm">Puedes añadir productos más tarde desde el panel de administración</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
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
                      type="button"
                      onClick={() => setActiveStep(5)}
                      className="px-6 py-2"
                    >
                      Ver Vista Previa
                    </Button>
                  </div>
                </div>
              )}

              {/* Paso 5: Vista Previa y Confirmación */}
              {activeStep === 5 && (
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
                                ? `url("${formData.descripcion_imagen_fondo}") center/cover no-repeat` 
                                : `linear-gradient(135deg, ${formData.color_primario || '#2563eb'}, ${formData.color_secundario || '#7c3aed'})`,
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
                      onClick={() => setActiveStep(4)}
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
      
      {/* Advertencia de migración */}
      {/* Advertencia de migración ya no es necesaria */}
    </div>
    </>
  );
}
