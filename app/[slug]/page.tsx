import { WebGeneratorService } from '@/lib/services/oftalmologia';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Phone } from 'lucide-react';
import { EmpresaLayout } from '@/components/empresa-layout';

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

export default async function EmpresaPage({ params }: PageProps) {
  const { slug } = await params;
  
  const empresa = await WebGeneratorService.getEmpresaBySlug(slug);
  
  if (!empresa) {
    notFound();
  }

  return (
    <EmpresaLayout empresa={empresa}>
      {/* Hero Section */}
      <section 
        className="relative text-white py-20 overflow-hidden" 
        style={{
          background: empresa.hero_fondo_tipo === 'imagen' && empresa.hero_imagen_fondo
            ? `url(${empresa.hero_imagen_fondo}) center/cover no-repeat`
            : `linear-gradient(135deg, ${empresa.color_primario || '#2563eb'}, ${empresa.color_secundario || '#7c3aed'})`
        }}
      >
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-6" style={{ 
            fontFamily: `'${empresa.tipografia}', sans-serif`
          }}>
            {empresa.nombre_empresa}
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
            {empresa.descripcion_empresa || `Bienvenido a ${empresa.nombre_empresa}`}
          </p>
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
            className="max-w-4xl mx-auto text-center p-8 rounded-lg"
            style={{
              background: empresa.descripcion_fondo_tipo === 'imagen' && empresa.descripcion_imagen_fondo
                ? `url(${empresa.descripcion_imagen_fondo}) center/cover no-repeat` 
                : `linear-gradient(135deg, ${empresa.color_primario || '#2563eb'}33, ${empresa.color_secundario || '#7c3aed'}33)`,
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              {empresa.tipo_negocio === 'servicios' ? 'Nuestros Servicios Profesionales' : 'Lo Que Hacemos'}
            </h2>
            
            {/* Video Promocional */}
            {empresa.video_promocional_url && (
              <div className="mt-10 max-w-3xl mx-auto">
                {empresa.video_descripcion && (
                  <p className="text-lg leading-relaxed mb-6" style={{
                    color: '#333',
                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                    padding: '12px',
                    borderRadius: '8px'
                  }}>
                    {empresa.video_descripcion}
                  </p>
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
                style={{ backgroundColor: empresa.color_primario || '#2563eb' }}
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