'use client';

import { useEffect, useRef } from 'react';
import type { Sucursal } from '@/lib/types/oftalmologia';

interface SimpleMapProps {
  sucursales: Sucursal[];
  colorPrimario?: string;
}

export default function SimpleGoogleMap({ sucursales, colorPrimario = '#2563eb' }: SimpleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey || !mapRef.current) return;

    let mapInstance: google.maps.Map | null = null;
    let markers: google.maps.Marker[] = [];
    let infoWindows: google.maps.InfoWindow[] = [];

    const initMap = async () => {
      // Cargar Google Maps API si no está cargada
      if (!window.google) {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=marker`;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
        
        await new Promise((resolve) => {
          script.onload = resolve;
        });
      }

      // Filtrar sucursales con coordenadas
      const sucursalesConCoordenadas = sucursales.filter(s => s.latitud && s.longitud);
      
      if (sucursalesConCoordenadas.length === 0) {
        if (mapRef.current) {
          mapRef.current.innerHTML = `
            <div class="flex items-center justify-center h-full bg-gray-50 rounded-lg border">
              <div class="text-center p-8">
                <div class="text-4xl mb-4">🗺️</div>
                <p class="text-gray-600 mb-2">Mapa no disponible</p>
                <p class="text-sm text-gray-500">No hay coordenadas para las sucursales</p>
              </div>
            </div>
          `;
        }
        return;
      }

      // Calcular centro del mapa
      const centerLat = sucursalesConCoordenadas.reduce((sum, s) => sum + Number(s.latitud), 0) / sucursalesConCoordenadas.length;
      const centerLng = sucursalesConCoordenadas.reduce((sum, s) => sum + Number(s.longitud), 0) / sucursalesConCoordenadas.length;

      // Crear mapa
      mapInstance = new window.google.maps.Map(mapRef.current, {
        center: { lat: centerLat, lng: centerLng },
        zoom: sucursalesConCoordenadas.length === 1 ? 15 : 12,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });

      // Agregar marcadores
      sucursalesConCoordenadas.forEach((sucursal) => {
        const marker = new window.google.maps.Marker({
          position: { lat: Number(sucursal.latitud), lng: Number(sucursal.longitud) },
          map: mapInstance,
          title: sucursal.nombre,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: colorPrimario,
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 3
          }
        });

        // Crear InfoWindow con información detallada
        const horarios = [
          { key: 'horario_lunes', label: 'Lunes' },
          { key: 'horario_martes', label: 'Martes' },
          { key: 'horario_miercoles', label: 'Miércoles' },
          { key: 'horario_jueves', label: 'Jueves' },
          { key: 'horario_viernes', label: 'Viernes' },
          { key: 'horario_sabado', label: 'Sábado' },
          { key: 'horario_domingo', label: 'Domingo' }
        ].filter(h => sucursal[h.key as keyof Sucursal])
         .map(h => `<div style="display: flex; justify-content: space-between; margin: 2px 0;"><span>${h.label}:</span><span style="font-weight: bold;">${sucursal[h.key as keyof Sucursal]}</span></div>`)
         .join('');

        const infoContent = `
          <div style="max-width: 280px; font-family: Arial, sans-serif;">
            <h3 style="font-weight: bold; margin: 0 0 12px 0; color: ${colorPrimario}; font-size: 16px;">${sucursal.nombre}</h3>
            
            <div style="margin-bottom: 12px;">
              <div style="display: flex; align-items: flex-start; margin-bottom: 8px;">
                <span style="color: ${colorPrimario}; margin-right: 8px;">📍</span>
                <span style="font-size: 14px; line-height: 1.4;">${sucursal.direccion}</span>
              </div>
              
              ${sucursal.telefono ? `
                <div style="display: flex; align-items: center; margin-bottom: 6px;">
                  <span style="color: ${colorPrimario}; margin-right: 8px;">📞</span>
                  <a href="tel:${sucursal.telefono}" style="color: ${colorPrimario}; text-decoration: none; font-size: 14px;">${sucursal.telefono}</a>
                </div>
              ` : ''}
              
              ${sucursal.whatsapp ? `
                <div style="display: flex; align-items: center; margin-bottom: 6px;">
                  <span style="color: #25D366; margin-right: 8px;">💬</span>
                  <a href="https://wa.me/${sucursal.whatsapp.replace(/[^0-9]/g, '')}" target="_blank" style="color: #25D366; text-decoration: none; font-size: 14px;">WhatsApp: ${sucursal.whatsapp}</a>
                </div>
              ` : ''}
              
              ${sucursal.email ? `
                <div style="display: flex; align-items: center; margin-bottom: 6px;">
                  <span style="color: ${colorPrimario}; margin-right: 8px;">✉️</span>
                  <a href="mailto:${sucursal.email}" style="color: ${colorPrimario}; text-decoration: none; font-size: 14px;">${sucursal.email}</a>
                </div>
              ` : ''}
            </div>
            
            ${horarios ? `
              <div style="border-top: 1px solid #e5e7eb; padding-top: 8px;">
                <div style="display: flex; align-items: center; margin-bottom: 6px;">
                  <span style="color: ${colorPrimario}; margin-right: 8px;">🕒</span>
                  <span style="font-weight: bold; font-size: 13px;">Horarios:</span>
                </div>
                <div style="font-size: 12px; color: #666;">
                  ${horarios}
                </div>
              </div>
            ` : ''}
          </div>
        `;

        const infoWindow = new window.google.maps.InfoWindow({
          content: infoContent
        });

        markers.push(marker);
        infoWindows.push(infoWindow);

        marker.addListener('click', () => {
          // Cerrar todas las ventanas de información abiertas
          infoWindows.forEach(iw => iw.close());
          infoWindow.open(mapInstance, marker);
        });
      });

      // Ajustar zoom para mostrar todos los marcadores
      if (sucursalesConCoordenadas.length > 1) {
        const bounds = new window.google.maps.LatLngBounds();
        sucursalesConCoordenadas.forEach(sucursal => {
          bounds.extend({ lat: Number(sucursal.latitud), lng: Number(sucursal.longitud) });
        });
        mapInstance.fitBounds(bounds);
        
        // Ajustar padding
        mapInstance.panToBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
      }
    };

    initMap();

    // Función de limpieza para evitar errores de removeChild
    return () => {
      try {
        // Cerrar todas las ventanas de información
        infoWindows.forEach(infoWindow => {
          if (infoWindow) {
            infoWindow.close();
          }
        });
        
        // Limpiar marcadores
        markers.forEach(marker => {
          if (marker) {
            marker.setMap(null);
          }
        });
        
        // Limpiar el contenido del div del mapa
        if (mapRef.current) {
          mapRef.current.innerHTML = '';
        }
      } catch (error) {
        // Ignorar errores de limpieza silenciosamente
        console.debug('Limpieza del mapa:', error);
      }
    };
  }, [sucursales, colorPrimario]);

  return (
    <div>
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">📍 Mapa de Ubicaciones</h3>
        <p className="text-gray-600 text-sm">
          Encuentra la sucursal más cercana. Haz clic en los marcadores para ver información detallada.
        </p>
      </div>
      <div 
        ref={mapRef} 
        className="w-full h-[500px] rounded-lg border border-gray-200 shadow-sm"
        style={{ minHeight: '400px' }}
      >
        <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-2" style={{ borderColor: colorPrimario }}></div>
            <p className="text-gray-600">Cargando mapa...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
