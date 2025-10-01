import { WebGeneratorService } from '@/lib/services/webgenerator';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Phone } from 'lucide-react';
import { EmpresaLayout } from '@/components/empresa-layout';
import { ConsejoModal } from '@/components/consejo-modal';
import { aplicarBrilloOpacidad } from '@/lib/utils/colorUtils';
import RichTextDisplay from '@/components/ui/rich-text-display';

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

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Configuración para forzar revalidación en producción
export const revalidate = 0; // Desactiva el cache estático
export const dynamic = 'force-dynamic'; // Fuerza rendering dinámico

export default async function EmpresaPage({ params }: PageProps) {
  const { slug } = await params;
  
  // Log para debugging en producción
  console.log(`[${new Date().toISOString()}] Cargando empresa con slug: ${slug}`);
  
  const empresa = await WebGeneratorService.getEmpresaBySlug(slug);
  
  if (!empresa) {
    notFound();
  }

  // Obtener color, brillo y opacidad de fondo de ventana flotante desde colorimetría o fallback
  const colorFondoVentana = empresa.ventana_flotante?.colores?.fondo?.color || empresa.ventana_flotante?.fondo_color || '#ffffff';
  const brilloVentanaFlotante = empresa.ventana_flotante?.colores?.fondo?.brillo || 100;
  const opacidadVentanaFlotante = empresa.ventana_flotante?.colores?.fondo?.opacidad || 100;

  // Log para debugging del color de ventana flotante
  console.log(`[${new Date().toISOString()}] Color ventana flotante:`, {
    desde_colorimetria: empresa.ventana_flotante?.colores?.fondo?.color,
    desde_campo_legacy: empresa.ventana_flotante?.fondo_color,
    color_final: colorFondoVentana,
    brillo: brilloVentanaFlotante,
    opacidad: opacidadVentanaFlotante,
    activo: empresa.ventana_flotante?.activo
  });

  // Log adicional para debugging de categorías/subcategorías
  console.log(`[${new Date().toISOString()}] Empresa cargada: ${empresa.nombre_empresa}`);
  console.log(`[${new Date().toISOString()}] Categorías encontradas: ${empresa.categorias?.length || 0}`);
  empresa.categorias?.forEach(cat => {
    console.log(`[${new Date().toISOString()}] Categoría "${cat.nombre}" - Subcategorías: ${cat.subcategorias?.length || 0}`);
  });

  return (
    <EmpresaLayout empresa={empresa}>
      {/* Modal de Consejo Diario */}
      <ConsejoModal
        isActive={empresa.ventana_flotante?.activo || false}
        titulo={empresa.ventana_flotante?.titulo || undefined}
        mensaje={empresa.ventana_flotante?.mensaje || undefined}
        imagenUrl={empresa.ventana_flotante?.imagen_url || undefined}
        videoUrl={empresa.ventana_flotante?.video_url || undefined}
        fondoTipo={empresa.ventana_flotante?.fondo_tipo || undefined}
        fondoColor={colorFondoVentana}
        fondoImagen={empresa.ventana_flotante?.fondo_imagen || undefined}
        brillo={brilloVentanaFlotante}
        opacidad={opacidadVentanaFlotante}
      />

      {/* Hero Section */}
      <section 
        className="relative text-white py-20 overflow-hidden" 
        style={{
          background: empresa.hero_fondo_tipo === 'imagen' && empresa.hero_imagen_fondo
            ? `url("${empresa.hero_imagen_fondo}") center/cover no-repeat`
            : `linear-gradient(135deg, ${empresa.colores?.primario?.color || '#2563eb'}, ${empresa.colores?.secundario?.color || '#7c3aed'})`
        }}
      >
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-6" style={{ 
            fontFamily: `'${empresa.tipografia}', sans-serif`
          }}>
            {empresa.nombre_empresa}
          </h1>
          <RichTextDisplay 
            content={empresa.descripcion_empresa || `Bienvenido a ${empresa.nombre_empresa}`}
            className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90"
          />
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {empresa.telefono_empresa && (
              <Button
                asChild
                size="lg"
                className="bg-white text-gray-800 hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <a href={`tel:${empresa.telefono_empresa}`} className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  {empresa.telefono_empresa}
                </a>
              </Button>
            )}
            <Button
              asChild
              size="lg"
              className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <a
                href={`https://wa.me/${(empresa.telefono_empresa || '').replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                📱 WhatsApp
              </a>
            </Button>
          </div>
        </div>
        
        {/* Elementos decorativos */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 right-10 w-48 h-48 bg-white/10 rounded-full blur-xl"></div>
      </section>

      {/* Sección de presentación de la empresa */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div 
            className="max-w-4xl mx-auto text-center p-8 rounded-lg relative overflow-hidden"
            style={{
              background: (empresa.descripcion_fondo_tipo === 'imagen' && empresa.descripcion_imagen_fondo) 
                ? `url("${empresa.descripcion_imagen_fondo}") center/cover no-repeat` 
                : `linear-gradient(135deg, ${empresa.colores?.primario?.color || '#2563eb'}, ${empresa.colores?.secundario?.color || '#7c3aed'})`,
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}
          >
            {/* Capa semi-transparente para mejorar legibilidad cuando es imagen */}
            {empresa.descripcion_fondo_tipo === 'imagen' && empresa.descripcion_imagen_fondo && (
              <div className="absolute inset-0 bg-white/70"></div>
            )}
            
            {/* Contenedor con posición relativa para estar por encima de la capa */}
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                {empresa.tipo_negocio === 'servicios' ? 'Nuestros Servicios Profesionales' : 'Lo Que Hacemos'}
              </h2>
              
              {/* Video Promocional */}
              {empresa.video_promocional_url && (
                <div className="mt-10 max-w-3xl mx-auto">
                  {empresa.video_descripcion && (
                    <div className="text-lg leading-relaxed mb-6" style={{
                      color: '#333',
                    padding: '12px',
                    borderRadius: '8px'
                  }}>
                    <RichTextDisplay content={empresa.video_descripcion} />
                  </div>
                )}
                <div className="aspect-video w-full shadow-lg rounded-xl overflow-hidden">
                  {empresa.video_promocional_url.includes('youtube.com') || empresa.video_promocional_url.includes('youtu.be') ? (
                    <iframe
                      width="100%"
                      height="100%"
                      src={formatYoutubeUrl(empresa.video_promocional_url)}
                      title="Video promocional"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="aspect-video"
                    ></iframe>
                  ) : empresa.video_promocional_url.includes('vimeo.com') ? (
                    <iframe
                      width="100%"
                      height="100%"
                      src={formatVimeoUrl(empresa.video_promocional_url)}
                      title="Video promocional"
                      frameBorder="0"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                      className="aspect-video"
                    ></iframe>
                  ) : (
                    <video
                      src={empresa.video_promocional_url}
                      controls
                      className="w-full h-full"
                    >
                      Tu navegador no soporta la reproducción de videos.
                    </video>
                  )}
                </div>
              </div>
            )}
            </div> {/* Cierre del div con posición relativa */}
          </div>
        </div>
      </section>

      {/* Llamada a la acción */}
      <section className="py-16 bg-gradient-to-r from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            ¿Listo para comenzar?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Contáctanos hoy mismo y descubre cómo podemos ayudarte
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {empresa.telefono_empresa && (
              <Button
                asChild
                size="lg"
                className="text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                style={{ backgroundColor: empresa.colores?.primario?.color || '#2563eb' }}
              >
                <a href={`tel:${empresa.telefono_empresa}`} className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Llamar Ahora
                </a>
              </Button>
            )}
            <Button
              asChild
              size="lg"
              className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <a
                href={`https://wa.me/${(empresa.telefono_empresa || '').replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                📱 WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </section>
    </EmpresaLayout>
  );
}