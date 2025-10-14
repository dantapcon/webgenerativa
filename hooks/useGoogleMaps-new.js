/**
 * Hook para cargar la API de Google Maps una sola vez
 */
import { useEffect, useState } from 'react';
import { loadGoogleMapsAPI, isGoogleMapsLoaded } from '@/lib/utils/google-maps-loader';

/**
 * Hook que maneja la carga de Google Maps API
 * @returns {Object} Estado de la carga de Google Maps
 */
export function useGoogleMaps() {
  const [isLoaded, setIsLoaded] = useState(isGoogleMapsLoaded());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Si ya está cargado, no hacer nada
    if (isGoogleMapsLoaded()) {
      setIsLoaded(true);
      return;
    }

    // Iniciar la carga
    setIsLoading(true);
    
    loadGoogleMapsAPI()
      .then(() => {
        setIsLoaded(true);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Error al cargar Google Maps');
        setIsLoading(false);
      });
  }, []);

  return {
    isLoaded,
    isLoading,
    error
  };
}