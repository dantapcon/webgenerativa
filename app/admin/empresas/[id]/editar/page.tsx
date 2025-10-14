'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { EmpresaFormData, EmpresaCompleta } from '@/lib/types/webgenerator';
import { WebGeneratorService } from '@/lib/services/webgenerator';
import { aplicarBrilloOpacidad } from '@/lib/utils/colorUtils';
import RichTextEditor from '@/components/ui/rich-text-editor';
import RichTextDisplay from '@/components/ui/rich-text-display';

// Función para extraer texto plano de HTML
function extractPlainText(html: string): string {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').trim();
}
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, Eye, Building } from 'lucide-react';
import SucursalesManager from '@/components/admin/SucursalesManager';
import AdminEmpresaIndividual from '@/components/admin/AdminEmpresaIndividual';
import ProductosManager from '@/components/admin/ProductosManager';
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
  // NUEVO: Campo para color terciario
  color_terciario?: string;
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
    video_promocional_url: '',
    color_primario: '#2563eb',
    color_secundario: '#1e40af',
    color_terciario: '#f97316' // NUEVO: Color terciario para regla 60-30-10
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
    fondo_tipo?: 'color' | 'imagen';
    fondo_color?: string;
    fondo_imagen?: string;
    subcategorias: Array<{
      id?: number;
      nombre: string;
      descripcion: string;
      imagen_url: string;
      enlace_externo: string;
      orden: number;
      fondo_color?: string;
      fondo_tipo?: 'color' | 'imagen';
      fondo_imagen?: string;
      brilloSubcategoria?: number;
      opacidadSubcategoria?: number;
    }>;
  }>>([]);

  // Estado para controles de brillo y opacidad
  const [categoriasBrilloOpacidad, setCategoriasBrilloOpacidad] = useState<Record<number, {brillo: number, opacidad: number}>>({});
  const [ventanaFlotanteBrilloOpacidad, setVentanaFlotanteBrilloOpacidad] = useState<{brillo: number, opacidad: number}>({brillo: 100, opacidad: 100});
  const [subcategoriasBrilloOpacidad, setSubcategoriasBrilloOpacidad] = useState<Record<number, {brillo: number, opacidad: number}>>({});

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  // Funciones auxiliares para aplicar efectos de color
  const aplicarBrilloOpacidad = (color: string, brillo: number = 100, opacidad: number = 100) => {
    if (!color || color === '#ffffff') return color;
    
    try {
      // Convertir hex a RGB
      const hex = color.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      
      // Aplicar brillo (ajustar luminosidad)
      const adjustBrightness = (value: number, brightnessPercent: number) => {
        const adjusted = value * (brightnessPercent / 100);
        return Math.min(255, Math.max(0, Math.round(adjusted)));
      };
      
      const rBright = adjustBrightness(r, brillo);
      const gBright = adjustBrightness(g, brillo);
      const bBright = adjustBrightness(b, brillo);
      
      // Aplicar opacidad
      const alpha = opacidad / 100;
      
      return `rgba(${rBright}, ${gBright}, ${bBright}, ${alpha})`;
    } catch (error) {
      console.error('Error aplicando brillo/opacidad:', error);
      return color;
    }
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
        
        console.log('🔍 DEBUG datos completos desde servicio:', {
          empresa_id: data.id,
          nombre: data.nombre_empresa,
          colores_empresa: data.colores,
          categorias_count: data.categorias?.length || 0,
          primera_categoria: data.categorias?.[0],
          ventana_flotante: data.ventana_flotante,
          estructura_colores: data.colores ? Object.keys(data.colores) : 'Sin colores'
        });
        
        setEmpresa(data);

        // ✅ CORREGIDO: Usar colores que ya vienen del servicio
        const colores = {
          primario: data.color_primario || '#2563eb',
          secundario: data.color_secundario || '#1e40af', 
          terciario: '#f97316'
        };

        // Priorizar colores del servicio de colorimetría
        if (data.colores) {
          if (data.colores.primario) colores.primario = data.colores.primario.color;
          if (data.colores.secundario) colores.secundario = data.colores.secundario.color;
          if (data.colores.terciario) colores.terciario = data.colores.terciario.color;
          console.log('✅ Colores de empresa desde servicio colorimetría:', colores);
        } else {
          console.log('⚠️ Empresa sin colores en servicio colorimetría, usando valores de BD directos:', {
            color_primario: data.color_primario,
            color_secundario: data.color_secundario
          });
        }

        console.log('🎨 DEBUG antes de asignar a formData:', {
          colores_cargados: colores,
          color_primario_final: colores.primario,
          color_secundario_final: colores.secundario,
          color_terciario_final: colores.terciario
        });

        // ✅ CORREGIDO: Cargar color de ventana flotante desde el servicio primero
        let colorVentanaFlotante = data.ventana_flotante?.fondo_color || '#ffffff';
        let brilloVentanaFlotante = 100;
        let opacidadVentanaFlotante = 100;
        
        // Priorizar colores del servicio de colorimetría
        if (data.ventana_flotante?.colores?.fondo) {
          colorVentanaFlotante = data.ventana_flotante.colores.fondo.color;
          brilloVentanaFlotante = data.ventana_flotante.colores.fondo.brillo || 100;
          opacidadVentanaFlotante = data.ventana_flotante.colores.fondo.opacidad || 100;
          console.log('✅ Color ventana flotante desde servicio colorimetría:', colorVentanaFlotante, `Brillo: ${brilloVentanaFlotante}%, Opacidad: ${opacidadVentanaFlotante}%`);
          
          // Actualizar estado de brillo y opacidad
          setVentanaFlotanteBrilloOpacidad({
            brillo: brilloVentanaFlotante,
            opacidad: opacidadVentanaFlotante
          });
        } else {
          console.log('⚠️ Ventana flotante sin colorimetría, usando valor directo de BD:', colorVentanaFlotante);
        }
        
        // Poblar formulario con datos existentes (incluyendo color de API)
        setFormData({
          nombre_empresa: data.nombre_empresa,
          descripcion_empresa: data.descripcion_empresa || '',
          hero_fondo_tipo: data.hero_fondo_tipo || 'color',
          hero_imagen_fondo: data.hero_imagen_fondo || '',
          descripcion_fondo_tipo: data.descripcion_fondo_tipo || 'color',
          descripcion_imagen_fondo: data.descripcion_imagen_fondo || '',
          video_descripcion: data.video_descripcion || '',
          // ✅ CORREGIDO: Asignar colores de empresa al formData
          color_primario: colores.primario,
          color_secundario: colores.secundario, 
          color_terciario: colores.terciario,
          // Campos para el modal de ventana flotante (color desde API)
          modal_activo: data.ventana_flotante?.activo || false,
          modal_titulo: data.ventana_flotante?.titulo || '',
          modal_mensaje: data.ventana_flotante?.mensaje || '',
          modal_imagen_url: data.ventana_flotante?.imagen_url || '',
          modal_video_url: data.ventana_flotante?.video_url || '',
          modal_fondo_tipo: data.ventana_flotante?.fondo_tipo || 'color',
          modal_fondo_color: colorVentanaFlotante,
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
          video_promocional_url: data.video_promocional_url || ''
        });
        
        // Cargar categorías y subcategorías con colores desde el servicio
        if (data.categorias && data.categorias.length > 0) {
          const categoriasConColores = await Promise.all(
            data.categorias.map(async (cat) => {
              console.log(`🔍 DEBUG categoria "${cat.nombre}":`, {
                id: cat.id,
                nombre: cat.nombre,
                colores: cat.colores,
                fondo_color: cat.fondo_color,
                tiene_colores_fondo: !!cat.colores?.fondo
              });
              
              // ✅ CORREGIDO: Usar colores que ya vienen del servicio primero
              let colorCategoria = '#ffffff';
              let brilloCategoria = 100;
              let opacidadCategoria = 100;
              
              // Priorizar colores del servicio
              if (cat.colores && cat.colores.fondo) {
                colorCategoria = cat.colores.fondo.color;
                brilloCategoria = cat.colores.fondo.brillo || 100;
                opacidadCategoria = cat.colores.fondo.opacidad || 100;
                console.log(`✅ Color de categoría "${cat.nombre}" desde servicio:`, colorCategoria, `Brillo: ${brilloCategoria}%, Opacidad: ${opacidadCategoria}%`);
              } else if (cat.fondo_color) {
                // Fallback al campo directo si existe
                colorCategoria = cat.fondo_color;
                console.log(`⚠️ Color de categoría "${cat.nombre}" desde fallback:`, colorCategoria);
              } else {
                console.log(`⚠️ Categoría "${cat.nombre}" sin color, usando blanco por defecto`);
              }

              return {
                id: cat.id,
                nombre: cat.nombre,
                descripcion: cat.descripcion || '',
                tipo_display: cat.tipo_display || 'horizontal',
                orden: cat.orden,
                fondo_tipo: cat.fondo_tipo || 'color',
                fondo_color: colorCategoria,
                fondo_imagen: cat.fondo_imagen || '',
                brilloCategoria,
                opacidadCategoria,
                subcategorias: cat.subcategorias ? await Promise.all(
                  cat.subcategorias.map(async (sub) => {
                    // ✅ CORREGIDO: Usar colores que ya vienen del servicio primero
                    let colorSubcategoria = '#ffffff';
                    let brilloSubcategoria = 100;
                    let opacidadSubcategoria = 100;
                    
                    // Priorizar colores del servicio
                    if (sub.colores && sub.colores.fondo) {
                      colorSubcategoria = sub.colores.fondo.color;
                      brilloSubcategoria = sub.colores.fondo.brillo || 100;
                      opacidadSubcategoria = sub.colores.fondo.opacidad || 100;
                    } else if ((sub as any).fondo_color) {
                      // Fallback al campo directo si existe
                      colorSubcategoria = (sub as any).fondo_color;
                    }
                    
                    // NUEVO: Recuperar color del localStorage si existe (para persistencia entre navegación)
                    if (sub.id && empresaId) {
                      const storageKey = `subcategoria_color_${empresaId}_${sub.id}`;
                      const colorGuardado = localStorage.getItem(storageKey);
                      if (colorGuardado) {
                        colorSubcategoria = colorGuardado;
                      }
                    }
                    
                    return {
                      id: sub.id,
                      nombre: sub.nombre,
                      descripcion: sub.descripcion || '',
                      imagen_url: sub.imagen_url || '',
                      enlace_externo: sub.enlace_externo || '',
                      orden: sub.orden,
                      fondo_tipo: (sub as any).fondo_tipo || 'color',
                      fondo_color: colorSubcategoria,
                      fondo_imagen: (sub as any).fondo_imagen || '',
                      brilloSubcategoria,
                      opacidadSubcategoria
                    };
                  })
                ) : []
              };
            })
          );
          
          // Actualizar estado de brillo y opacidad para todas las categorías de una vez
          const brilloOpacidadMap: Record<number, {brillo: number, opacidad: number}> = {};
          const subcategoriasBrilloOpacidadMap: Record<number, {brillo: number, opacidad: number}> = {};
          
          // ✅ NUEVO: Poblar caché de colores de subcategorías
          const subcategoriasColoresCacheMap: Record<number, {
            fondo_color: string;
            brillo: number;
            opacidad: number;
            fondo_tipo: string;
            fondo_imagen: string;
          }> = {};
          
          categoriasConColores.forEach(cat => {
            if (cat.id) {
              brilloOpacidadMap[cat.id] = {
                brillo: cat.brilloCategoria,
                opacidad: cat.opacidadCategoria
              };
            }
            
            // También actualizar subcategorías
            cat.subcategorias?.forEach((sub: any) => {
              if (sub.id) {
                subcategoriasBrilloOpacidadMap[sub.id] = {
                  brillo: sub.brilloSubcategoria,
                  opacidad: sub.opacidadSubcategoria
                };
              }
            });
          });
          
          setCategoriasBrilloOpacidad(brilloOpacidadMap);
          setSubcategoriasBrilloOpacidad(subcategoriasBrilloOpacidadMap);
          
          console.log('🎨 Categorías finales con colores:', categoriasConColores.map(cat => ({
            nombre: cat.nombre,
            id: cat.id,
            fondo_color: cat.fondo_color,
            subcategorias: cat.subcategorias?.map(sub => ({
              nombre: sub.nombre,
              id: sub.id,
              fondo_color: sub.fondo_color
            }))
          })));
          setCategorias(categoriasConColores);
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
    
    // Cleanup timeouts al desmontar
    return () => {
      Object.values(subcategoriaTimeouts).forEach(timeout => {
        clearTimeout(timeout);
      });
    };
  }, [empresaId, router]);

  // Efecto para asegurar que los colores de subcategorías se mantengan actualizados
  useEffect(() => {
    if (categorias.length > 0) {
      const subcategoriasBrilloOpacidadMap: Record<number, {brillo: number, opacidad: number}> = {};
      
      categorias.forEach(cat => {
        cat.subcategorias?.forEach((sub: any) => {
          if (sub.id && (sub.brilloSubcategoria !== undefined || sub.opacidadSubcategoria !== undefined)) {
            subcategoriasBrilloOpacidadMap[sub.id] = {
              brillo: sub.brilloSubcategoria || 100,
              opacidad: sub.opacidadSubcategoria || 100
            };
          }
        });
      });
      
      if (Object.keys(subcategoriasBrilloOpacidadMap).length > 0) {
        setSubcategoriasBrilloOpacidad(prev => ({
          ...prev,
          ...subcategoriasBrilloOpacidadMap
        }));
      }
    }
  }, [categorias]);

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

  // Función para validar y normalizar colores hexadecimales
  const validateAndNormalizeColor = (color: string): string => {
    if (!color) return '#ffffff';
    
    // Quitar espacios en blanco
    color = color.trim();
    
    // Si no empieza con #, agregarlo
    if (!color.startsWith('#')) {
      color = '#' + color;
    }
    
    // Validar formato hexadecimal
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (!hexRegex.test(color)) {
      console.warn('Color inválido:', color, 'usando #ffffff por defecto');
      return '#ffffff';
    }
    
    // Convertir de 3 a 6 dígitos si es necesario
    if (color.length === 4) {
      color = '#' + color[1] + color[1] + color[2] + color[2] + color[3] + color[3];
    }
    
    return color.toUpperCase();
  };

  // Función para manejar cambios de color en categorías y guardar en API
  const handleCategoriaColorChange = async (catIndex: number, newColor: string) => {
    const categoria = categorias[catIndex];
    
    // Validar y normalizar el color
    const colorNormalizado = validateAndNormalizeColor(newColor);
    
    console.log('🔍 DEBUG handleCategoriaColorChange:', {
      catIndex,
      newColor_original: newColor,
      newColor_normalizado: colorNormalizado,
      categoria: categoria,
      categoriaId: categoria.id,
      empresaId
    });
    
    // Actualizar estado local inmediatamente con el color normalizado
    const newCategorias = [...categorias];
    newCategorias[catIndex].fondo_color = colorNormalizado;
    setCategorias(newCategorias);

    // Guardar en API si la categoría tiene ID
    if (categoria.id && empresaId) {
      try {
        // Obtener valores actuales de brillo y opacidad o usar valores por defecto
        const valoresActuales = categoriasBrilloOpacidad[categoria.id] || {brillo: 100, opacidad: 100};
        
        const colorData = {
          referencia_id: categoria.id,
          tipo_elemento: 'categoria',
          subtipo: 'fondo',
          color: colorNormalizado,
          brillo: valoresActuales.brillo,
          opacidad: valoresActuales.opacidad
        };

        console.log('🚀 Enviando a API colorimetría:', colorData);

        const response = await fetch('/api/colorimetria', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(colorData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Error API response:', errorData);
          throw new Error(`Error al guardar color de categoría: ${errorData.error || 'Unknown error'}`);
        }

        console.log(`Color de categoría ${categoria.nombre} guardado:`, colorNormalizado);
      } catch (error) {
        console.error('Error guardando color de categoría:', error);
        showAlert('error', 'Error al guardar el color de la categoría');
      }
    }
  };

  // Función para manejar cambios de brillo/opacidad en categorías
  const handleCategoriaBrilloOpacidadChange = async (catIndex: number, tipo: 'brillo' | 'opacidad', valor: number) => {
    const categoria = categorias[catIndex];
    
    if (categoria.id) {
      // Actualizar estado local
      setCategoriasBrilloOpacidad(prev => ({
        ...prev,
        [categoria.id!]: {
          ...prev[categoria.id!] || {brillo: 100, opacidad: 100},
          [tipo]: valor
        }
      }));

      // Guardar en API
      try {
        const valoresActuales = categoriasBrilloOpacidad[categoria.id] || {brillo: 100, opacidad: 100};
        const nuevosValores = {...valoresActuales, [tipo]: valor};
        
        const colorData = {
          referencia_id: categoria.id,
          tipo_elemento: 'categoria',
          subtipo: 'fondo',
          color: categoria.fondo_color || '#ffffff',
          brillo: nuevosValores.brillo,
          opacidad: nuevosValores.opacidad
        };

        const response = await fetch('/api/colorimetria', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(colorData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Error API response:', errorData);
          throw new Error(`Error al guardar ${tipo} de categoría: ${errorData.error || 'Unknown error'}`);
        }

        console.log(`${tipo} de categoría ${categoria.nombre} guardado:`, valor);
      } catch (error) {
        console.error(`Error guardando ${tipo} de categoría:`, error);
        showAlert('error', `Error al guardar el ${tipo} de la categoría`);
      }
    }
  };

  // Función para manejar cambios de color en ventana flotante y guardar en API
  const handleVentanaFlotanteColorChange = async (newColor: string) => {
    // Validar y normalizar el color
    const colorNormalizado = validateAndNormalizeColor(newColor);
    
    // Actualizar estado local inmediatamente
    setFormData(prev => ({
      ...prev,
      modal_fondo_color: colorNormalizado
    }));

    // Guardar en API si la ventana flotante tiene ID
    if (empresa?.ventana_flotante?.id) {
      try {
        const colorData = {
          referencia_id: empresa.ventana_flotante.id,
          tipo_elemento: 'ventana_flotante',
          subtipo: 'fondo',
          color: colorNormalizado,
          brillo: ventanaFlotanteBrilloOpacidad.brillo,
          opacidad: ventanaFlotanteBrilloOpacidad.opacidad
        };

        const response = await fetch('/api/colorimetria', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(colorData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Error API response:', errorData);
          throw new Error(`Error al guardar color de ventana flotante: ${errorData.error || 'Unknown error'}`);
        }

        console.log('Color de ventana flotante guardado:', newColor);
      } catch (error) {
        console.error('Error guardando color de ventana flotante:', error);
        showAlert('error', 'Error al guardar el color de la ventana flotante');
      }
    }
  };

  // Función para manejar cambios de brillo/opacidad en ventana flotante
  const handleVentanaFlotanteBrilloOpacidadChange = async (tipo: 'brillo' | 'opacidad', valor: number) => {
    // Actualizar estado local
    setVentanaFlotanteBrilloOpacidad(prev => ({
      ...prev,
      [tipo]: valor
    }));

    // Guardar en API si la ventana flotante tiene ID
    if (empresa?.ventana_flotante?.id) {
      try {
        const nuevosValores = {...ventanaFlotanteBrilloOpacidad, [tipo]: valor};
        
        const colorData = {
          referencia_id: empresa.ventana_flotante.id,
          tipo_elemento: 'ventana_flotante',
          subtipo: 'fondo',
          color: formData.modal_fondo_color || '#ffffff',
          brillo: nuevosValores.brillo,
          opacidad: nuevosValores.opacidad
        };

        const response = await fetch('/api/colorimetria', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(colorData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Error API response:', errorData);
          throw new Error(`Error al guardar ${tipo} de ventana flotante: ${errorData.error || 'Unknown error'}`);
        }

        console.log(`${tipo} de ventana flotante guardado:`, valor);
      } catch (error) {
        console.error(`Error guardando ${tipo} de ventana flotante:`, error);
        showAlert('error', `Error al guardar el ${tipo} de la ventana flotante`);
      }
    }
  };

  // Función helper para obtener el color actual de una subcategoría
  const getSubcategoriaColor = (subcategoria: any) => {
    // Primero intentar obtener de los datos de empresa actualizados
    if (empresa?.categorias) {
      for (const cat of empresa.categorias) {
        const sub = cat.subcategorias?.find(s => s.id === subcategoria.id);
        if (sub?.colores?.fondo?.color) {
          console.log(`🎨 Color encontrado en empresa.categorias para ${subcategoria.nombre}:`, sub.colores.fondo.color);
          return sub.colores.fondo.color;
        }
      }
    }
    
    // Fallback al color local o blanco
    const fallbackColor = subcategoria.fondo_color || '#ffffff';
    console.log(`🎨 Usando color fallback para ${subcategoria.nombre}:`, fallbackColor);
    return fallbackColor;
  };

  // Función para manejar cambios de color en subcategorías y guardar en API con debounce
  const handleSubcategoriaColorChange = async (catIndex: number, subIndex: number, newColor: string) => {
    const subcategoria = categorias[catIndex].subcategorias?.[subIndex];
    
    // Validar y normalizar el color
    const colorNormalizado = validateAndNormalizeColor(newColor);
    
    // Actualizar estado local inmediatamente con el color normalizado
    const newCategorias = [...categorias];
    if (newCategorias[catIndex].subcategorias?.[subIndex]) {
      newCategorias[catIndex].subcategorias[subIndex].fondo_color = colorNormalizado;
    }
    setCategorias(newCategorias);
    
    // PERSISTIR en localStorage para evitar pérdida al navegar
    if (subcategoria?.id) {
      const storageKey = `subcategoria_color_${empresaId}_${subcategoria.id}`;
      localStorage.setItem(storageKey, colorNormalizado);
    }
    
    // Guardar en API si la subcategoría tiene ID
    if (subcategoria?.id && empresaId) {
      // Debounce para color también
      const timeoutKey = `${subcategoria.id}-color`;
      if (subcategoriaTimeouts[timeoutKey]) {
        clearTimeout(subcategoriaTimeouts[timeoutKey]);
      }

      const newTimeout = setTimeout(async () => {
        try {
          // Obtener valores actuales de brillo y opacidad o usar valores por defecto
          const valoresActuales = subcategoriasBrilloOpacidad[subcategoria.id!] || {brillo: 100, opacidad: 100};
          
          const colorData = {
            referencia_id: subcategoria.id,
            tipo_elemento: 'subcategoria',
            subtipo: 'fondo',
            color: colorNormalizado,
            brillo: valoresActuales.brillo,
            opacidad: valoresActuales.opacidad
          };

          const response = await fetch('/api/colorimetria', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(colorData),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Error al guardar color de subcategoría: ${errorData.error || 'Unknown error'}`);
          }

          // Limpiar localStorage una vez guardado en BD
          const storageKey = `subcategoria_color_${empresaId}_${subcategoria.id}`;
          localStorage.removeItem(storageKey);
          
        } catch (error) {
          showAlert('error', 'Error al guardar el color de la subcategoría');
        }
      }, 300); // Debounce más corto para color

      setSubcategoriaTimeouts(prev => ({
        ...prev,
        [timeoutKey]: newTimeout
      }));
    }
  };

  // Estado para debounce de subcategorías
  const [subcategoriaTimeouts, setSubcategoriaTimeouts] = useState<Record<string, NodeJS.Timeout>>({});

  // Función para manejar cambios de brillo/opacidad en subcategorías con debounce
  const handleSubcategoriaBrilloOpacidadChange = async (catIndex: number, subIndex: number, tipo: 'brillo' | 'opacidad', valor: number) => {
    const subcategoria = categorias[catIndex].subcategorias?.[subIndex];
    
    if (subcategoria?.id) {
      // Actualizar estado local inmediatamente para feedback visual
      setSubcategoriasBrilloOpacidad(prev => ({
        ...prev,
        [subcategoria.id!]: {
          ...prev[subcategoria.id!] || {brillo: 100, opacidad: 100},
          [tipo]: valor
        }
      }));

      // Debounce: cancelar timeout anterior y crear uno nuevo
      const timeoutKey = `${subcategoria.id}-${tipo}`;
      if (subcategoriaTimeouts[timeoutKey]) {
        clearTimeout(subcategoriaTimeouts[timeoutKey]);
      }

      const newTimeout = setTimeout(async () => {
        // Guardar en API después del debounce
        try {
          const valoresActuales = subcategoriasBrilloOpacidad[subcategoria.id!] || {brillo: 100, opacidad: 100};
          const nuevosValores = {...valoresActuales, [tipo]: valor};
          
          const colorData = {
            referencia_id: subcategoria.id,
            tipo_elemento: 'subcategoria',
            subtipo: 'fondo',
            color: subcategoria.fondo_color || '#ffffff',
            brillo: nuevosValores.brillo,
            opacidad: nuevosValores.opacidad
          };

          const response = await fetch('/api/colorimetria', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(colorData),
          });

          if (!response.ok) {
            const errorData = await response.json();
            console.error('Error API response:', errorData);
            throw new Error(`Error al guardar ${tipo} de subcategoría: ${errorData.error || 'Unknown error'}`);
          }

          const responseData = await response.json();
          console.log(`✅ ${tipo} de subcategoría ${subcategoria.nombre} guardado:`, valor, responseData);
          
          // NO recargar datos para evitar loop infinito
          // Los cambios se reflejarán en el próximo refresh manual
          
        } catch (error) {
          console.error(`Error guardando ${tipo} de subcategoría:`, error);
          showAlert('error', `Error al guardar el ${tipo} de la subcategoría`);
        }
      }, 500); // Esperar 500ms antes de guardar

      setSubcategoriaTimeouts(prev => ({
        ...prev,
        [timeoutKey]: newTimeout
      }));
    }
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
      fondo_tipo?: 'color' | 'imagen';
      fondo_color?: string;
      fondo_imagen?: string;
    };
    
    type CategoriaType = {
      id?: number;
      nombre: string;
      descripcion: string;
      tipo_display?: 'horizontal' | 'vertical';
      orden: number;
      fondo_tipo?: 'color' | 'imagen';
      fondo_color?: string;
      fondo_imagen?: string;
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
          fondo_tipo: cat.fondo_tipo || 'color',
          fondo_color: cat.fondo_color || '#ffffff',
          fondo_imagen: cat.fondo_imagen || '',
          subcategorias: [] as any[]
        };
        
        // Procesar subcategorías (incluso si es un array vacío)
        if (cat.subcategorias && Array.isArray(cat.subcategorias)) {
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
                orden: sub.orden || 0,
                fondo_tipo: sub.fondo_tipo || 'color',
                fondo_color: sub.fondo_color || '#ffffff',
                fondo_imagen: sub.fondo_imagen || ''
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
              console.log(`Subcategoría "${sub.nombre}" - ID: ${sub.id} - Será ${sub.id ? 'actualizada' : 'creada'}`);
              return subcategoriaLimpia;
            });
            
            console.log(`Categoría "${cat.nombre}" procesada con ${catProcesada.subcategorias.length} subcategorías`);
        } else {
          console.log(`Categoría "${cat.nombre}" NO tiene subcategorías o el array no es válido`);
          catProcesada.subcategorias = []; // Asegurar que siempre hay un array
        }
        
        console.log(`Categoría "${cat.nombre}" procesada:`, catProcesada);
        console.log(`  - Subcategorías procesadas: ${catProcesada.subcategorias.length}`);
        catProcesada.subcategorias.forEach((sub: any, idx: number) => {
          console.log(`  - Subcategoría ${idx + 1}: "${sub.nombre}" (ID: ${sub.id || 'nueva'})`);
        });
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
    { id: 'productos', label: 'Productos', icon: '📦' },
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

      // Validar email si está presente
      if (formData.correo_empresa && formData.correo_empresa.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.correo_empresa.trim())) {
          showAlert('error', 'El email debe tener un formato válido');
          return;
        }
      }

      // Validar y procesar categorías
      const categoriasValidadas = procesarCategorias();
      
      // Log para debug
      console.log('Categorías a enviar:', JSON.stringify(categoriasValidadas, null, 2));
      
      // Separar datos de empresa, ventana flotante y colores
      const {
        modal_activo,
        modal_titulo,
        modal_mensaje,
        modal_imagen_url,
        modal_video_url,
        modal_fondo_tipo,
        modal_fondo_color,
        modal_fondo_imagen,
        color_primario,
        color_secundario,
        color_terciario,
        ...datosEmpresa
      } = formData;

      // Limpiar y validar el email
      if (datosEmpresa.correo_empresa) {
        datosEmpresa.correo_empresa = datosEmpresa.correo_empresa.trim();
        // Si el email está vacío después del trim, enviarlo como undefined
        if (datosEmpresa.correo_empresa === '') {
          datosEmpresa.correo_empresa = undefined;
        }
      } else {
        datosEmpresa.correo_empresa = undefined;
      }

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
      
      // Actualizar empresa
      await WebGeneratorService.updateEmpresa(empresaId, datosEmpresa, categoriasValidadas, datosVentanaFlotante);
      
      // Actualizar colores usando la API de colorimetría (enviar cada color por separado)
      const coloresActualizar = [
        { subtipo: 'primario', color: color_primario || '#2563eb' },
        { subtipo: 'secundario', color: color_secundario || '#1e40af' },
        { subtipo: 'terciario', color: color_terciario || '#f97316' }
      ];

      for (const colorInfo of coloresActualizar) {
        const colorResponse = await fetch('/api/colorimetria', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            referencia_id: empresaId,
            tipo_elemento: 'empresa',
            subtipo: colorInfo.subtipo,
            color: colorInfo.color,
            brillo: 100,
            opacidad: 100
          }),
        });

        if (!colorResponse.ok) {
          const errorText = await colorResponse.text();
          console.error(`Error actualizando color ${colorInfo.subtipo}:`, errorText);
          throw new Error(`Error al actualizar color ${colorInfo.subtipo}`);
        }
      }

      showAlert('success', 'Empresa y colores actualizados exitosamente');
      
      // Recargar datos para mostrar los cambios guardados
      if (empresaId) {
        const data = await WebGeneratorService.getEmpresaById(empresaId);
        if (data) {
          setEmpresa(data);
          
          // Actualizar categorías con los datos frescos de la BD
          if (data.categorias && data.categorias.length > 0) {
            setCategorias(data.categorias.map(cat => ({
              id: cat.id,
              nombre: cat.nombre,
              descripcion: cat.descripcion || '',
              tipo_display: cat.tipo_display || 'horizontal',
              orden: cat.orden,
              fondo_tipo: cat.fondo_tipo || 'color',
              fondo_color: cat.fondo_color || '#ffffff',
              fondo_imagen: cat.fondo_imagen || '',
              subcategorias: cat.subcategorias ? cat.subcategorias.map(sub => ({
                id: sub.id,
                nombre: sub.nombre,
                descripcion: sub.descripcion || '',
                imagen_url: sub.imagen_url || '',
                enlace_externo: sub.enlace_externo || '',
                orden: sub.orden,
                fondo_tipo: sub.fondo_tipo || 'color',
                fondo_color: sub.fondo_color || '#ffffff',
                fondo_imagen: sub.fondo_imagen || ''
              })) : []
            })));
          }
        }
      }
      
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
            <p className="text-sm text-gray-600">{extractPlainText(empresa.nombre_empresa)}</p>
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
          {activeSection === 'productos' && empresaId ? (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">📦 Gestión de Productos</h2>
                <p className="text-gray-600">Administrar el catálogo de productos de la empresa</p>
              </div>
              <ProductosManager empresaId={empresaId} />
            </div>
          ) : activeSection === 'sucursales' && empresaId ? (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">📍 Gestión de Sucursales</h2>
                <p className="text-gray-600">Administrar las ubicaciones de la empresa</p>
              </div>
              <SucursalesManager empresaId={empresaId} empresa={empresa} />
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
                  <RichTextEditor
                    value={formData.nombre_empresa || ''}
                    onChange={(content) => setFormData(prev => ({ ...prev, nombre_empresa: content }))}
                    placeholder="Ingrese el nombre de la empresa con formato"
                  />
                  <p className="text-xs text-gray-500">Puede aplicar formato, colores y estilos al nombre</p>
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
                  <RichTextEditor
                    value={formData.descripcion_empresa || ''}
                    onChange={(value) => setFormData(prev => ({ ...prev, descripcion_empresa: value }))}
                    placeholder="Describe tu empresa..."
                    className="w-full"
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
                    <div className="mb-3 space-y-1">
                      <h4 className="font-medium text-sm text-gray-700">Colores de la Marca</h4>
                      <p className="text-xs text-gray-500">Regla 60-30-10: Color dominante, secundario y de acento</p>
                    </div>
                    <div className="space-y-4">
                      {/* Color Primario - 60% */}
                      <div className="space-y-2">
                        <Label htmlFor="color_primario" className="text-sm flex items-center gap-2">
                          Color Primario (60%)
                          <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Dominante</span>
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            id="color_primario"
                            name="color_primario"
                            type="color"
                            value={formData.color_primario || '#2563eb'}
                            onChange={handleInputChange}
                            className="w-12 h-10 p-1"
                          />
                          <Input
                            value={formData.color_primario || '#2563eb'}
                            onChange={(e) => setFormData(prev => ({ ...prev, color_primario: e.target.value }))}
                            placeholder="#2563eb"
                            className="flex-1 text-sm"
                          />
                        </div>
                      </div>

                      {/* Color Secundario - 30% */}
                      <div className="space-y-2">
                        <Label htmlFor="color_secundario" className="text-sm flex items-center gap-2">
                          Color Secundario (30%)
                          <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">Complemento</span>
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            id="color_secundario"
                            name="color_secundario"
                            type="color"
                            value={formData.color_secundario || '#1e40af'}
                            onChange={handleInputChange}
                            className="w-12 h-10 p-1"
                          />
                          <Input
                            value={formData.color_secundario || '#1e40af'}
                            onChange={(e) => setFormData(prev => ({ ...prev, color_secundario: e.target.value }))}
                            placeholder="#1e40af"
                            className="flex-1 text-sm"
                          />
                        </div>
                      </div>

                      {/* Color Terciario - 10% */}
                      <div className="space-y-2">
                        <Label htmlFor="color_terciario" className="text-sm flex items-center gap-2">
                          Color Terciario (10%)
                          <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">Acento</span>
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            id="color_terciario"
                            name="color_terciario"
                            type="color"
                            value={formData.color_terciario || '#f97316'}
                            onChange={handleInputChange}
                            className="w-12 h-10 p-1"
                          />
                          <Input
                            value={formData.color_terciario || '#f97316'}
                            onChange={(e) => setFormData(prev => ({ ...prev, color_terciario: e.target.value }))}
                            placeholder="#f97316"
                            className="flex-1 text-sm"
                          />
                        </div>
                      </div>

                      {/* Vista previa de colores */}
                      <div className="mt-3 p-3 border rounded-lg bg-white">
                        <p className="text-xs text-gray-500 mb-2">Vista previa:</p>
                        <div className="flex h-8 rounded overflow-hidden">
                          <div 
                            className="flex-[60] flex items-center justify-center text-white text-xs font-medium"
                            style={{ backgroundColor: formData.color_primario || '#2563eb' }}
                          >
                            60%
                          </div>
                          <div 
                            className="flex-[30] flex items-center justify-center text-white text-xs font-medium"
                            style={{ backgroundColor: formData.color_secundario || '#1e40af' }}
                          >
                            30%
                          </div>
                          <div 
                            className="flex-[10] flex items-center justify-center text-white text-xs font-medium"
                            style={{ backgroundColor: formData.color_terciario || '#f97316' }}
                          >
                            10%
                          </div>
                        </div>
                      </div>
                    </div>
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

                {/* Columna 3: Preview del Título */}
                <div className="space-y-4">
                  
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
                      <div className="flex-1 truncate">
                        <div className="text-lg font-bold text-gray-900">
                          {extractPlainText(formData.nombre_empresa || 'Empresa')}
                        </div>
                      </div>
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
                        <RichTextEditor
                          value={formData.video_descripcion || ''}
                          onChange={(content) => setFormData(prev => ({ ...prev, video_descripcion: content }))}
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
                    <RichTextEditor
                      value={formData.modal_titulo || ''}
                      onChange={(value) => setFormData(prev => ({ ...prev, modal_titulo: value }))}
                      placeholder="Ej: ¡Bienvenido! o Información importante"
                    />
                  </div>

                  {/* Mensaje */}
                  <div className="space-y-2">
                    <Label htmlFor="modal_mensaje">Mensaje de la ventana</Label>
                    <RichTextEditor
                      value={formData.modal_mensaje || ''}
                      onChange={(value) => setFormData(prev => ({ ...prev, modal_mensaje: value }))}
                      placeholder="Escribe tu mensaje de bienvenida, información importante o promoción..."
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
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="modal_fondo_color">Color de fondo</Label>
                          <div className="flex gap-2">
                            <Input
                              id="modal_fondo_color"
                              name="modal_fondo_color"
                              type="color"
                              value={formData.modal_fondo_color || '#ffffff'}
                              onChange={(e) => handleVentanaFlotanteColorChange(e.target.value)}
                              className="w-16 h-10 p-1"
                            />
                            <Input
                              type="text"
                              value={formData.modal_fondo_color || '#ffffff'}
                              onChange={(e) => handleVentanaFlotanteColorChange(e.target.value)}
                              className="flex-1 h-10"
                              placeholder="#ffffff"
                            />
                          </div>
                        </div>

                        {/* Controles de Brillo y Opacidad */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Brillo */}
                          <div className="space-y-2">
                            <Label htmlFor="modal_brillo">
                              Brillo: {ventanaFlotanteBrilloOpacidad.brillo}%
                            </Label>
                            <input
                              id="modal_brillo"
                              type="range"
                              min="0"
                              max="200"
                              value={ventanaFlotanteBrilloOpacidad.brillo}
                              onChange={(e) => handleVentanaFlotanteBrilloOpacidadChange('brillo', parseInt(e.target.value))}
                              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>0%</span>
                              <span>100%</span>
                              <span>200%</span>
                            </div>
                          </div>

                          {/* Opacidad */}
                          <div className="space-y-2">
                            <Label htmlFor="modal_opacidad">
                              Opacidad: {ventanaFlotanteBrilloOpacidad.opacidad}%
                            </Label>
                            <input
                              id="modal_opacidad"
                              type="range"
                              min="0"
                              max="100"
                              value={ventanaFlotanteBrilloOpacidad.opacidad}
                              onChange={(e) => handleVentanaFlotanteBrilloOpacidadChange('opacidad', parseInt(e.target.value))}
                              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>0%</span>
                              <span>50%</span>
                              <span>100%</span>
                            </div>
                          </div>
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
                          : aplicarBrilloOpacidad(
                              formData.modal_fondo_color || '#ffffff',
                              ventanaFlotanteBrilloOpacidad.brillo,
                              ventanaFlotanteBrilloOpacidad.opacidad
                            )
                      }}>
                        {formData.modal_titulo && (
                          <div className="text-lg font-bold text-gray-800 mb-2">
                            <RichTextDisplay content={formData.modal_titulo} />
                          </div>
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
                          <div className="text-gray-700 text-sm">
                            <RichTextDisplay content={formData.modal_mensaje} />
                          </div>
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
                      <span className="inline-flex items-center">
                        Categoría: <RichTextDisplay content={categoria.nombre || 'Sin nombre'} className="inline ml-1" />
                      </span>
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
                      <RichTextEditor
                        value={categoria.descripcion}
                        onChange={(content) => {
                          const newCategorias = [...categorias];
                          newCategorias[catIndex].descripcion = content;
                          setCategorias(newCategorias);
                        }}
                        placeholder="Descripción de la categoría..."
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
                    
                    {/* Personalización de Fondo */}
                    <div className="pt-4 border-t border-gray-200">
                      <h6 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                        🎨 Fondo de la Categoría
                      </h6>
                      
                      <div className="grid gap-3">
                        <div>
                          <Label htmlFor={`cat-fondo-tipo-${catIndex}`}>Tipo de Fondo</Label>
                          <select
                            id={`cat-fondo-tipo-${catIndex}`}
                            value={categoria.fondo_tipo || 'color'}
                            onChange={(e) => {
                              const newCategorias = [...categorias];
                              newCategorias[catIndex].fondo_tipo = e.target.value as 'color' | 'imagen';
                              setCategorias(newCategorias);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="color">Color Sólido</option>
                            <option value="imagen">Imagen de Fondo</option>
                          </select>
                        </div>
                        
                        {categoria.fondo_tipo === 'color' ? (
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor={`cat-fondo-color-${catIndex}`}>Color de Fondo</Label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="color"
                                  id={`cat-fondo-color-${catIndex}`}
                                  value={categoria.fondo_color || '#ffffff'}
                                  onChange={(e) => {
                                    handleCategoriaColorChange(catIndex, e.target.value);
                                  }}
                                  className="w-12 h-10 border border-gray-300 rounded-md cursor-pointer"
                                />
                                <Input
                                  value={categoria.fondo_color || '#ffffff'}
                                  onChange={(e) => {
                                    handleCategoriaColorChange(catIndex, e.target.value);
                                  }}
                                  placeholder="#ffffff"
                                  className="flex-1"
                                />
                                <div className="text-xs text-gray-500">
                                  Color final: {aplicarBrilloOpacidad(
                                    categoria.fondo_color || '#ffffff',
                                    categoria.id ? (categoriasBrilloOpacidad[categoria.id]?.brillo || 100) : 100,
                                    categoria.id ? (categoriasBrilloOpacidad[categoria.id]?.opacidad || 100) : 100
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Controles de Brillo y Opacidad */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Brillo */}
                              <div className="space-y-2">
                                <Label htmlFor={`cat-brillo-${catIndex}`}>
                                  Brillo: {categoria.id ? (categoriasBrilloOpacidad[categoria.id]?.brillo || 100) : 100}%
                                </Label>
                                <input
                                  id={`cat-brillo-${catIndex}`}
                                  type="range"
                                  min="0"
                                  max="200"
                                  value={categoria.id ? (categoriasBrilloOpacidad[categoria.id]?.brillo || 100) : 100}
                                  onChange={(e) => handleCategoriaBrilloOpacidadChange(catIndex, 'brillo', parseInt(e.target.value))}
                                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                />
                                <div className="flex justify-between text-xs text-gray-500">
                                  <span>0%</span>
                                  <span>100%</span>
                                  <span>200%</span>
                                </div>
                              </div>

                              {/* Opacidad */}
                              <div className="space-y-2">
                                <Label htmlFor={`cat-opacidad-${catIndex}`}>
                                  Opacidad: {categoria.id ? (categoriasBrilloOpacidad[categoria.id]?.opacidad || 100) : 100}%
                                </Label>
                                <input
                                  id={`cat-opacidad-${catIndex}`}
                                  type="range"
                                  min="0"
                                  max="100"
                                  value={categoria.id ? (categoriasBrilloOpacidad[categoria.id]?.opacidad || 100) : 100}
                                  onChange={(e) => handleCategoriaBrilloOpacidadChange(catIndex, 'opacidad', parseInt(e.target.value))}
                                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                />
                                <div className="flex justify-between text-xs text-gray-500">
                                  <span>0%</span>
                                  <span>50%</span>
                                  <span>100%</span>
                                </div>
                              </div>
                            </div>

                            {/* Vista previa del color aplicado */}
                            <div className="mt-3">
                              <Label className="text-xs text-gray-600 mb-1 block">Vista previa:</Label>
                              <div 
                                className="w-full h-8 rounded border border-gray-300"
                                style={{
                                  backgroundColor: aplicarBrilloOpacidad(
                                    categoria.fondo_color || '#ffffff',
                                    categoria.id ? (categoriasBrilloOpacidad[categoria.id]?.brillo || 100) : 100,
                                    categoria.id ? (categoriasBrilloOpacidad[categoria.id]?.opacidad || 100) : 100
                                  )
                                }}
                              ></div>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <Label htmlFor={`cat-fondo-imagen-${catIndex}`}>URL de Imagen de Fondo</Label>
                            <Input
                              id={`cat-fondo-imagen-${catIndex}`}
                              value={categoria.fondo_imagen || ''}
                              onChange={(e) => {
                                const newCategorias = [...categorias];
                                newCategorias[catIndex].fondo_imagen = e.target.value;
                                setCategorias(newCategorias);
                              }}
                              placeholder="https://ejemplo.com/imagen.jpg"
                            />
                          </div>
                        )}
                      </div>
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
                            <span className="inline-flex items-center">
                              Subcategoría: <RichTextDisplay content={subcategoria.nombre || 'Sin nombre'} className="inline ml-1" />
                            </span>
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
                            <RichTextEditor
                              value={subcategoria.nombre || ''}
                              onChange={(content) => {
                                const newCategorias = JSON.parse(JSON.stringify(categorias));
                                if (!newCategorias[catIndex].subcategorias[subIndex]) {
                                  newCategorias[catIndex].subcategorias[subIndex] = {};
                                }
                                newCategorias[catIndex].subcategorias[subIndex].nombre = content;
                                setCategorias(newCategorias);
                              }}
                              placeholder="Nombre de la subcategoría..."
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor={`sub-desc-${catIndex}-${subIndex}`} className="text-xs">Descripción</Label>
                            <RichTextEditor
                              value={subcategoria.descripcion || ''}
                              onChange={(content) => {
                                const newCategorias = JSON.parse(JSON.stringify(categorias));
                                if (!newCategorias[catIndex].subcategorias[subIndex]) {
                                  newCategorias[catIndex].subcategorias[subIndex] = {};
                                }
                                newCategorias[catIndex].subcategorias[subIndex].descripcion = content;
                                setCategorias(newCategorias);
                              }}
                              placeholder="Descripción de la subcategoría..."
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
                          
                          {/* Controles de Color de Fondo */}
                          <div className="space-y-2">
                            <Label className="text-xs font-medium">Color de Fondo</Label>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={subcategoria.fondo_color || '#ffffff'}
                                onChange={(e) => handleSubcategoriaColorChange(catIndex, subIndex, e.target.value)}
                                className="w-10 h-8 border border-gray-300 rounded cursor-pointer"
                              />
                              <Input
                                type="text"
                                value={subcategoria.fondo_color || '#ffffff'}
                                onChange={(e) => handleSubcategoriaColorChange(catIndex, subIndex, e.target.value)}
                                className="flex-1 text-sm"
                                placeholder="#ffffff"
                              />
                            </div>
                          </div>

                          {/* Controles de Brillo y Opacidad */}
                          <div className="space-y-3">
                            <div>
                              <Label className="text-xs font-medium">
                                Brillo: {subcategoria.id ? (subcategoriasBrilloOpacidad[subcategoria.id]?.brillo || 100) : 100}%
                              </Label>
                              <input
                                type="range"
                                min="0"
                                max="200"
                                step="1"
                                value={subcategoria.id ? (subcategoriasBrilloOpacidad[subcategoria.id]?.brillo || 100) : 100}
                                onChange={(e) => handleSubcategoriaBrilloOpacidadChange(
                                  catIndex,
                                  subIndex,
                                  'brillo',
                                  parseInt(e.target.value)
                                )}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                              />
                              <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>0%</span>
                                <span>100%</span>
                                <span>200%</span>
                              </div>
                            </div>
                            
                            <div>
                              <Label className="text-xs font-medium">
                                Opacidad: {subcategoria.id ? (subcategoriasBrilloOpacidad[subcategoria.id]?.opacidad || 100) : 100}%
                              </Label>
                              <input
                                type="range"
                                min="0"
                                max="100"
                                step="1"
                                value={subcategoria.id ? (subcategoriasBrilloOpacidad[subcategoria.id]?.opacidad || 100) : 100}
                                onChange={(e) => handleSubcategoriaBrilloOpacidadChange(
                                  catIndex,
                                  subIndex,
                                  'opacidad',
                                  parseInt(e.target.value)
                                )}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                              />
                              <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>0%</span>
                                <span>50%</span>
                                <span>100%</span>
                              </div>
                            </div>
                          </div>

                          {/* Vista previa del color con efectos */}
                          <div className="space-y-2">
                            <Label className="text-xs font-medium">Vista Previa</Label>
                            <div 
                              className="w-full h-12 border border-gray-300 rounded"
                              style={{ 
                                backgroundColor: aplicarBrilloOpacidad(
                                  subcategoria.fondo_color || '#ffffff',
                                  subcategoria.id ? (subcategoriasBrilloOpacidad[subcategoria.id]?.brillo || 100) : 100,
                                  subcategoria.id ? (subcategoriasBrilloOpacidad[subcategoria.id]?.opacidad || 100) : 100
                                )
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
                      fondo_tipo: 'color',
                      fondo_color: '#ffffff',
                      fondo_imagen: '',
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
          {activeSection !== 'productos' && activeSection !== 'sucursales' && activeSection !== 'administrador' && (
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