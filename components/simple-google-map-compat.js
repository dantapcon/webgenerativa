'use client';

import { useEffect, useRef } from 'react';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';

/**
 * Componente de Google Maps compatible con producción
 * Usa marcadores tradicionales para evitar problemas de mapId
 */
export default function SimpleGoogleMapCompat({ sucursales, colorPrimario = '#2563eb' }) {
  const mapRef = useRef(null);
  const { isLoaded, isLoading, error } = useGoogleMaps();

  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;

    let mapInstance = null;
    let markers = [];
    let infoWindows = [];

    const initMap = () => {
      try {
        // Filtrar sucursales con coordenadas válidas
        const sucursalesConCoordenadas = sucursales.filter(s => 
          s.latitud && s.longitud && 
          !isNaN(parseFloat(s.latitud)) && 
          !isNaN(parseFloat(s.longitud))
        );
        
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

        // Configuración inicial del mapa (SIN mapId para compatibilidad)
        const mapOptions = {
          zoom: sucursalesConCoordenadas.length === 1 ? 15 : 12,
          center: {
            lat: parseFloat(sucursalesConCoordenadas[0].latitud),
            lng: parseFloat(sucursalesConCoordenadas[0].longitud)
          },
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        };

        // Crear el mapa
        mapInstance = new google.maps.Map(mapRef.current, mapOptions);

        // Crear marcadores tradicionales (compatibles)
        sucursalesConCoordenadas.forEach((sucursal, index) => {
          const position = {
            lat: parseFloat(sucursal.latitud),
            lng: parseFloat(sucursal.longitud)
          };

          // Usar siempre marcadores tradicionales
          const marker = new google.maps.Marker({
            position,
            map: mapInstance,
            title: sucursal.nombre,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: colorPrimario,
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2
            }
          });

          // Crear ventana de información
          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div style="padding: 10px; max-width: 250px;">
                <h3 style="margin: 0 0 8px 0; color: ${colorPrimario}; font-size: 16px; font-weight: bold;">
                  ${sucursal.nombre}
                </h3>
                <p style="margin: 4px 0; font-size: 14px; color: #666;">
                  <strong>📍 Dirección:</strong><br>
                  ${sucursal.direccion}
                </p>
                ${sucursal.telefono ? `
                  <p style="margin: 4px 0; font-size: 14px; color: #666;">
                    <strong>📞 Teléfono:</strong><br>
                    ${sucursal.telefono}
                  </p>
                ` : ''}
                ${sucursal.horario ? `
                  <p style="margin: 4px 0; font-size: 14px; color: #666;">
                    <strong>🕒 Horario:</strong><br>
                    ${sucursal.horario}
                  </p>
                ` : ''}
              </div>
            `
          });

          // Agregar event listener
          marker.addListener('click', () => {
            infoWindows.forEach(iw => iw.close());
            infoWindow.open(mapInstance, marker);
          });

          markers.push(marker);
          infoWindows.push(infoWindow);
        });

        // Ajustar el zoom para mostrar todos los marcadores
        if (sucursalesConCoordenadas.length > 1) {
          const bounds = new google.maps.LatLngBounds();
          sucursalesConCoordenadas.forEach(sucursal => {
            bounds.extend({
              lat: parseFloat(sucursal.latitud),
              lng: parseFloat(sucursal.longitud)
            });
          });
          mapInstance.fitBounds(bounds);
          
          // Evitar zoom excesivo
          const listener = google.maps.event.addListener(mapInstance, 'idle', () => {
            if (mapInstance.getZoom() > 16) {
              mapInstance.setZoom(16);
            }
            google.maps.event.removeListener(listener);
          });
        }

      } catch (error) {
        console.error('Error inicializando el mapa:', error);
        if (mapRef.current) {
          mapRef.current.innerHTML = `
            <div class="flex items-center justify-center h-full bg-red-50 rounded-lg border border-red-200">
              <div class="text-center p-8">
                <div class="text-4xl mb-4">❌</div>
                <p class="text-red-600 mb-2">Error al cargar el mapa</p>
                <p class="text-sm text-red-500">Verifica la configuración de Google Maps</p>
              </div>
            </div>
          `;
        }
      }
    };

    initMap();

    // Cleanup function
    return () => {
      markers.forEach(marker => marker.setMap(null));
      infoWindows.forEach(infoWindow => infoWindow.close());
      markers = [];
      infoWindows = [];
      mapInstance = null;
    };

  }, [isLoaded, sucursales, colorPrimario]);

  // Estados de carga
  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-red-50 rounded-lg border border-red-200">
        <div className="text-center p-8">
          <div className="text-4xl mb-4">❌</div>
          <p className="text-red-600 mb-2">Error al cargar Google Maps</p>
          <p className="text-sm text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg border">
        <div className="text-center p-8">
          <div className="animate-spin text-4xl mb-4">🗺️</div>
          <p className="text-gray-600 mb-2">Cargando mapa...</p>
          <p className="text-sm text-gray-500">Inicializando Google Maps</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={mapRef} 
      className="w-full h-full min-h-[300px] rounded-lg border"
      style={{ minHeight: '300px' }}
    />
  );
}