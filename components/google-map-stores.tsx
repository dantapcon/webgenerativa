'use client';

import { useEffect, useRef } from 'react';
import type { Sucursal } from '@/lib/types/oftalmologia';

interface GoogleMapWithStoresProps {
  sucursales: Sucursal[];
  empresaNombre: string;
  colorPrimario?: string;
}

export default function GoogleMapWithStores({ 
  sucursales, 
  empresaNombre, 
  colorPrimario = '#2563eb' 
}: GoogleMapWithStoresProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const storeLocatorRef = useRef<any>(null);

  useEffect(() => {
    // Verificar si Google Maps API está disponible
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.warn('Google Maps API key no configurada');
      return;
    }

    // Cargar Google Maps API y Extended Component Library
    const loadGoogleMaps = async () => {
      try {
        // Cargar Google Maps API
        if (!window.google) {
          const script = document.createElement('script');
          script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,marker&loading=async`;
          script.async = true;
          script.defer = true;
          document.head.appendChild(script);
          
          await new Promise((resolve) => {
            script.onload = resolve;
          });
        }

        // Cargar Extended Component Library
        if (!customElements.get('gmpx-store-locator')) {
          const extendedScript = document.createElement('script');
          extendedScript.src = 'https://unpkg.com/@googlemaps/extended-component-library@0.6';
          extendedScript.type = 'module';
          document.head.appendChild(extendedScript);
          
          await new Promise((resolve) => {
            extendedScript.onload = resolve;
          });
        }

        // Esperar a que el componente esté definido
        await customElements.whenDefined('gmpx-store-locator');
        
        // Configurar el store locator
        setupStoreLocator();
      } catch (error) {
        console.error('Error cargando Google Maps:', error);
      }
    };

    const setupStoreLocator = () => {
      if (!mapRef.current || sucursales.length === 0) return;

      // Limpiar contenido anterior
      mapRef.current.innerHTML = '';

      // Convertir sucursales a formato de Google Store Locator
      const stores = sucursales
        .filter(sucursal => sucursal.latitud && sucursal.longitud)
        .map((sucursal, index) => ({
          id: sucursal.id.toString(),
          displayName: sucursal.nombre,
          addressLines: [sucursal.direccion],
          location: {
            lat: Number(sucursal.latitud),
            lng: Number(sucursal.longitud)
          },
          phoneNumber: sucursal.telefono || '',
          websiteUri: sucursal.whatsapp ? `https://wa.me/${sucursal.whatsapp.replace(/[^0-9]/g, '')}` : '',
          openingHours: {
            periods: []
          }
        }));

      if (stores.length === 0) {
        mapRef.current.innerHTML = `
          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <div class="text-yellow-600 mb-2">⚠️ Coordenadas no disponibles</div>
            <p class="text-sm text-gray-600">
              Las sucursales necesitan coordenadas para mostrarse en el mapa. 
              <br>Configura tu Google Maps API key para habilitar la geocodificación automática.
            </p>
          </div>
        `;
        return;
      }

      // Calcular centro del mapa
      const centerLat = stores.reduce((sum, store) => sum + store.location.lat, 0) / stores.length;
      const centerLng = stores.reduce((sum, store) => sum + store.location.lng, 0) / stores.length;

      // Configuración del Store Locator
      const configuration = {
        "locations": stores,
        "capabilities": {
          "input": true,
          "autocomplete": true,
          "directions": false,
          "distanceMatrix": true,
          "details": true,
          "actions": false
        },
        "mapOptions": {
          "center": {
            "lat": centerLat,
            "lng": centerLng
          },
          "fullscreenControl": true,
          "mapTypeControl": false,
          "streetViewControl": false,
          "zoom": stores.length === 1 ? 15 : 12,
          "zoomControl": true,
          "maxZoom": 18,
          "minZoom": 8,
          "restriction": {},
          "styles": []
        },
        "mapsId": ""
      };

      // Crear elemento store-locator
      const storeLocatorElement = document.createElement('gmpx-store-locator');
      storeLocatorElement.style.width = '100%';
      storeLocatorElement.style.height = '500px';
      storeLocatorElement.style.borderRadius = '12px';
      storeLocatorElement.style.overflow = 'hidden';
      storeLocatorElement.style.border = '1px solid #e5e7eb';
      
      mapRef.current.appendChild(storeLocatorElement);
      storeLocatorRef.current = storeLocatorElement;

      // Configurar desde la configuración
      setTimeout(() => {
        try {
          (storeLocatorElement as any).configureFromQuickBuilder(configuration);
        } catch (error) {
          console.error('Error configurando store locator:', error);
          // Fallback a mapa básico
          createBasicMap();
        }
      }, 100);
    };

    const createBasicMap = () => {
      if (!mapRef.current || !window.google) return;

      // Limpiar contenido
      mapRef.current.innerHTML = '';

      // Crear contenedor del mapa
      const mapContainer = document.createElement('div');
      mapContainer.style.width = '100%';
      mapContainer.style.height = '500px';
      mapContainer.style.borderRadius = '12px';
      mapContainer.style.overflow = 'hidden';
      mapContainer.style.border = '1px solid #e5e7eb';
      
      mapRef.current.appendChild(mapContainer);

      // Configurar mapa básico
      const sucursalesConCoordenadas = sucursales.filter(s => s.latitud && s.longitud);
      
      if (sucursalesConCoordenadas.length === 0) {
        mapContainer.innerHTML = `
          <div class="flex items-center justify-center h-full bg-gray-50">
            <div class="text-center">
              <div class="text-gray-400 mb-2">🗺️</div>
              <p class="text-gray-600">Mapa no disponible sin coordenadas</p>
            </div>
          </div>
        `;
        return;
      }

      // Calcular centro
      const centerLat = sucursalesConCoordenadas.reduce((sum, s) => sum + Number(s.latitud), 0) / sucursalesConCoordenadas.length;
      const centerLng = sucursalesConCoordenadas.reduce((sum, s) => sum + Number(s.longitud), 0) / sucursalesConCoordenadas.length;

      // Crear mapa
      const map = new window.google.maps.Map(mapContainer, {
        center: { lat: centerLat, lng: centerLng },
        zoom: sucursalesConCoordenadas.length === 1 ? 15 : 12,
        styles: []
      });

      // Agregar marcadores
      sucursalesConCoordenadas.forEach((sucursal) => {
        const marker = new window.google.maps.Marker({
          position: { lat: Number(sucursal.latitud), lng: Number(sucursal.longitud) },
          map: map,
          title: sucursal.nombre
        });

        // Info window
        const infoContent = `
          <div style="max-width: 250px;">
            <h3 style="font-weight: bold; margin: 0 0 8px 0; color: ${colorPrimario};">${sucursal.nombre}</h3>
            <p style="margin: 0 0 8px 0; font-size: 14px;">${sucursal.direccion}</p>
            ${sucursal.telefono ? `<p style="margin: 0 0 4px 0; font-size: 13px;"><strong>Tel:</strong> ${sucursal.telefono}</p>` : ''}
            ${sucursal.whatsapp ? `<p style="margin: 0 0 4px 0; font-size: 13px;"><strong>WhatsApp:</strong> ${sucursal.whatsapp}</p>` : ''}
          </div>
        `;

        const infoWindow = new window.google.maps.InfoWindow({
          content: infoContent
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });
      });
    };

    loadGoogleMaps();
  }, [sucursales, empresaNombre, colorPrimario]);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <div className="text-yellow-600 mb-2 text-lg">⚠️ Configuración pendiente</div>
        <p className="text-sm text-gray-700 mb-2">
          <strong>Para mostrar el mapa:</strong>
        </p>
        <ol className="text-sm text-gray-600 text-left max-w-md mx-auto">
          <li>1. Ve a <a href="https://console.cloud.google.com" target="_blank" className="text-blue-600 underline">Google Cloud Console</a></li>
          <li>2. Activa: <strong>Maps JavaScript API</strong> y <strong>Geocoding API</strong></li>
          <li>3. Crea una API Key</li>
          <li>4. Agrégala a tu archivo .env.local como <code className="bg-gray-100 px-1">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code></li>
        </ol>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Mapa de Ubicaciones</h3>
        <p className="text-gray-600 text-sm">
          Encuentra la sucursal más cercana a ti. Haz clic en los marcadores para más información.
        </p>
      </div>
      <div ref={mapRef} className="w-full">
        <div className="flex items-center justify-center h-[500px] bg-gray-50 rounded-lg border">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-2" style={{ borderColor: colorPrimario }}></div>
            <p className="text-gray-600">Cargando mapa...</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Declaraciones globales para TypeScript
declare global {
  interface Window {
    google: any;
  }
}
