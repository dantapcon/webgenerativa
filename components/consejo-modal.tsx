'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

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
    return '';
  }
}

interface VentanaFlotanteProps {
  isActive: boolean;
  titulo?: string;
  mensaje?: string;
  imagenUrl?: string;
  videoUrl?: string;
  fondoTipo?: 'color' | 'imagen';
  fondoColor?: string;
  fondoImagen?: string;
}

export function ConsejoModal({
  isActive,
  titulo,
  mensaje,
  imagenUrl,
  videoUrl,
  fondoTipo = 'color',
  fondoColor = '#ffffff',
  fondoImagen
}: VentanaFlotanteProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isActive && (titulo || mensaje)) {
      // Mostrar el modal después de un pequeño delay para mejor UX
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isActive, titulo, mensaje]);

  if (!isActive || !isVisible || (!titulo && !mensaje)) {
    return null;
  }

  const handleClose = () => {
    setIsVisible(false);
  };

  const modalStyle = {
    background: fondoTipo === 'imagen' && fondoImagen
      ? `linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9)), url("${fondoImagen}") center/cover no-repeat`
      : fondoColor || '#ffffff'
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div 
        className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto relative"
        style={modalStyle}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón de cerrar */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors z-10"
          aria-label="Cerrar"
        >
          <X className="h-5 w-5 text-gray-600" />
        </button>

        {/* Contenido del modal */}
        <div className="p-6 space-y-4">
          {/* Título */}
          {titulo && (
            <h2 className="text-2xl font-bold text-gray-800 pr-8">
              {titulo}
            </h2>
          )}

          {/* Imagen */}
          {imagenUrl && (
            <div className="flex justify-center">
              <img
                src={imagenUrl}
                alt="Imagen de la ventana flotante"
                className="max-w-full h-auto rounded-lg shadow-sm max-h-48 object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Video */}
          {videoUrl && (
            <div className="flex justify-center">
              <div className="aspect-video w-full max-w-sm border rounded-lg overflow-hidden bg-gray-100 shadow-sm">
                {videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be') ? (
                  <iframe
                    width="100%"
                    height="100%"
                    src={formatYoutubeUrl(videoUrl)}
                    title="Video de la ventana flotante"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="aspect-video"
                  ></iframe>
                ) : videoUrl.includes('vimeo.com') ? (
                  <iframe
                    width="100%"
                    height="100%"
                    src={formatVimeoUrl(videoUrl)}
                    title="Video de la ventana flotante"
                    frameBorder="0"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    className="aspect-video"
                  ></iframe>
                ) : (
                  <video
                    src={videoUrl}
                    controls
                    className="w-full h-full"
                    onError={(e) => {
                      e.currentTarget.outerHTML = '<div class="flex items-center justify-center h-full text-gray-500 text-sm">Video no disponible</div>';
                    }}
                  >
                    Tu navegador no soporta la reproducción de videos.
                  </video>
                )}
              </div>
            </div>
          )}

          {/* Mensaje */}
          {mensaje && (
            <div className="text-gray-700 leading-relaxed whitespace-pre-line">
              {mensaje}
            </div>
          )}

          {/* Botón de cerrar inferior (opcional) */}
          {/* 
          <div className="flex justify-center pt-4">
            <button
              onClick={handleClose}
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              Entendido
            </button>
          </div>
          */}
        </div>
      </div>

      {/* Overlay que cierra el modal al hacer clic fuera */}
      <div 
        className="absolute inset-0 -z-10"
        onClick={handleClose}
      />
    </div>
  );
}
