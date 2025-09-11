/**
 * Hook para cargar la API de Google Maps una sola vez
 */
import { useEffect, useState } from 'react';

// Estado global para evitar múltiples cargas
let isGoogleMapsLoaded = false;
let isGoogleMapsLoading = false;
let googleMapsPromise = null;

/**
 * Hook que maneja la carga de Google Maps API
 * @returns {Object} Estado de la carga de Google Maps
 */
export function useGoogleMaps() {
  const [isLoaded, setIsLoaded] = useState(isGoogleMapsLoaded);
  const [isLoading, setIsLoading] = useState(isGoogleMapsLoading);
  const [error, setError] = useState(null);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      setError('Google Maps API key no está configurada');
      return;
    }

    // Si ya está cargado, no hacer nada
    if (isGoogleMapsLoaded) {
      setIsLoaded(true);
      return;
    }

    // Si ya se está cargando, esperar la promesa existente
    if (isGoogleMapsLoading && googleMapsPromise) {
      googleMapsPromise
        .then(() => {
          setIsLoaded(true);
          setIsLoading(false);
        })
        .catch((err) => {
          setError(err.message || 'Error al cargar Google Maps');
          setIsLoading(false);
        });
      return;
    }

    // Iniciar la carga
    isGoogleMapsLoading = true;
    setIsLoading(true);

    googleMapsPromise = new Promise((resolve, reject) => {
      // Verificar si ya existe el script
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      
      if (existingScript) {
        // Si el script ya existe, esperar a que se cargue
        if (window.google && window.google.maps) {
          isGoogleMapsLoaded = true;
          isGoogleMapsLoading = false;
          resolve(window.google);
        } else {
          existingScript.addEventListener('load', () => {
            isGoogleMapsLoaded = true;
            isGoogleMapsLoading = false;
            resolve(window.google);
          });
          existingScript.addEventListener('error', () => {
            isGoogleMapsLoading = false;
            reject(new Error('Error al cargar Google Maps'));
          });
        }
        return;
      }

      // Función callback para Google Maps
      window.initGoogleMaps = () => {
        isGoogleMapsLoaded = true;
        isGoogleMapsLoading = false;
        delete window.initGoogleMaps;
        resolve(window.google);
      };

      // Crear nuevo script
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=marker&loading=async&callback=initGoogleMaps`;
      script.async = true;
      script.defer = true;

      script.onerror = () => {
        isGoogleMapsLoading = false;
        delete window.initGoogleMaps;
        reject(new Error('Error al cargar Google Maps'));
      };

      document.head.appendChild(script);
    });

    googleMapsPromise
      .then(() => {
        setIsLoaded(true);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Error al cargar Google Maps');
        setIsLoading(false);
      });

  }, []);

  return { isLoaded, isLoading, error };
}