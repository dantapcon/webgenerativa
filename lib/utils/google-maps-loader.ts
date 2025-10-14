// Utilidad para cargar Google Maps API de forma centralizada
// Evita cargas múltiples y maneja el estado global

let isLoading = false;
let isLoaded = false;
let loadPromise: Promise<void> | null = null;

export async function loadGoogleMapsAPI(): Promise<void> {
  // Si ya está cargado, resolver inmediatamente
  if (isLoaded && (window as any).google) {
    return Promise.resolve();
  }

  // Si ya se está cargando, retornar la promesa existente
  if (isLoading && loadPromise) {
    return loadPromise;
  }

  // Crear nueva promesa de carga
  loadPromise = new Promise<void>((resolve, reject) => {
    // Verificar si Google Maps ya existe
    if ((window as any).google && (window as any).google.maps) {
      isLoaded = true;
      resolve();
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      reject(new Error('Google Maps API key no configurada'));
      return;
    }

    isLoading = true;

    // Verificar si el script ya existe
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      // Si existe pero no está cargado, esperar a que cargue
      const checkLoaded = () => {
        if ((window as any).google && (window as any).google.maps) {
          isLoaded = true;
          isLoading = false;
          resolve();
        } else {
          setTimeout(checkLoaded, 100);
        }
      };
      checkLoaded();
      return;
    }

    // Crear nuevo script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry&loading=async`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      // Verificar que google.maps esté disponible después de la carga
      const checkGoogleMaps = () => {
        if ((window as any).google && (window as any).google.maps && (window as any).google.maps.Map) {
          isLoaded = true;
          isLoading = false;
          resolve();
        } else {
          setTimeout(checkGoogleMaps, 50);
        }
      };
      checkGoogleMaps();
    };

    script.onerror = () => {
      isLoading = false;
      reject(new Error('Error cargando Google Maps API'));
    };

    document.head.appendChild(script);
  });

  return loadPromise;
}

export function isGoogleMapsLoaded(): boolean {
  return !!(isLoaded && (window as any).google && (window as any).google.maps && (window as any).google.maps.Map);
}

export function resetGoogleMapsLoader(): void {
  isLoading = false;
  isLoaded = false;
  loadPromise = null;
}