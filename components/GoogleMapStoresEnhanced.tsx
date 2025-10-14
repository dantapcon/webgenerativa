'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Sucursal } from '@/lib/types/webgenerator';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, Mail, Navigation, Clock, ExternalLink, MapPin } from 'lucide-react';
import { loadGoogleMapsAPI } from '@/lib/utils/google-maps-loader';

interface GoogleMapStoresEnhancedProps {
  sucursales: Sucursal[];
  className?: string;
  height?: string;
  zoom?: number;
  empresa?: {
    nombre_empresa: string;
    telefono_empresa?: string;
    correo_empresa?: string;
  };
}

declare global {
  interface Window {
    openDirections: (lat: number, lng: number) => void;
  }
}

export default function GoogleMapStoresEnhanced({ 
  sucursales, 
  className = "", 
  height = "400px",
  zoom = 13,
  empresa
}: GoogleMapStoresEnhancedProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedSucursal, setSelectedSucursal] = useState<Sucursal | null>(null);
  const [directionsService, setDirectionsService] = useState<any>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<any>(null);

  // Filtrar sucursales que tienen coordenadas válidas
  const sucursalesConCoordenadas = sucursales.filter(
    sucursal => sucursal.latitud && sucursal.longitud
  );

  useEffect(() => {
    const loadGoogleMaps = async () => {
      try {
        await loadGoogleMapsAPI();
        initializeMap();
      } catch (error) {
        console.error('Error cargando Google Maps:', error);
      }
    };

    loadGoogleMaps();
  }, []);

  const initializeMap = () => {
    if (!mapRef.current || !(window as any).google || sucursalesConCoordenadas.length === 0) return;

    // Calcular centro del mapa
    const centerLat = sucursalesConCoordenadas.reduce((sum, s) => sum + Number(s.latitud), 0) / sucursalesConCoordenadas.length;
    const centerLng = sucursalesConCoordenadas.reduce((sum, s) => sum + Number(s.longitud), 0) / sucursalesConCoordenadas.length;

    const mapInstance = new (window as any).google.maps.Map(mapRef.current, {
      center: { lat: centerLat, lng: centerLng },
      zoom: zoom,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ],
      mapTypeControl: false,
      streetViewControl: true,
      fullscreenControl: true,
      zoomControl: true
    });

    setMap(mapInstance);

    // Servicios de direcciones
    const dirService = new (window as any).google.maps.DirectionsService();
    const dirRenderer = new (window as any).google.maps.DirectionsRenderer({
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: '#3b82f6',
        strokeWeight: 4,
        strokeOpacity: 0.8
      }
    });
    
    dirRenderer.setMap(mapInstance);
    setDirectionsService(dirService);
    setDirectionsRenderer(dirRenderer);

    // Crear marcadores personalizados para sucursales
    sucursalesConCoordenadas.forEach((sucursal) => {
      const customMarker = createCustomMarker(sucursal, mapInstance);
      
      const infoWindow = new (window as any).google.maps.InfoWindow({
        content: createInfoWindowContent(sucursal)
      });

      customMarker.addListener('click', () => {
        infoWindow.open(mapInstance, customMarker);
        setSelectedSucursal(sucursal);
      });
    });

    // Obtener ubicación del usuario
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(userPos);

          // Crear marcador para ubicación del usuario
          new (window as any).google.maps.Marker({
            position: userPos,
            map: mapInstance,
            title: 'Tu ubicación',
            icon: {
              path: (window as any).google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: '#3b82f6',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 3
            },
            animation: (window as any).google.maps.Animation.DROP
          });
        },
        (error) => {
          console.log('Error obteniendo ubicación:', error);
        }
      );
    }
  };

  const createCustomMarker = (sucursal: Sucursal, mapInstance: any) => {
    const marker = new (window as any).google.maps.Marker({
      position: { 
        lat: Number(sucursal.latitud), 
        lng: Number(sucursal.longitud) 
      },
      map: mapInstance,
      title: sucursal.nombre,
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="40" height="50" viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="2" dy="4" stdDeviation="3" flood-color="rgba(0,0,0,0.3)"/>
              </filter>
            </defs>
            <path d="M20 0C12.3 0 6 6.3 6 14c0 10.5 14 36 14 36s14-25.5 14-36C34 6.3 27.7 0 20 0z" 
                  fill="#e74c3c" filter="url(#shadow)"/>
            <circle cx="20" cy="14" r="8" fill="white"/>
            <text x="20" y="18" font-family="Arial" font-size="12" font-weight="bold" 
                  text-anchor="middle" fill="#e74c3c">📍</text>
          </svg>
        `),
        scaledSize: new (window as any).google.maps.Size(40, 50),
        anchor: new (window as any).google.maps.Point(20, 50)
      },
      animation: (window as any).google.maps.Animation.DROP
    });

    return marker;
  };

  const createInfoWindowContent = (sucursal: Sucursal) => {
    return `
      <div style="max-width: 250px; padding: 8px;">
        <h3 style="margin: 0 0 8px 0; font-weight: bold; font-size: 16px;">${sucursal.nombre}</h3>
        <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">${sucursal.direccion}</p>
        ${sucursal.telefono ? `
          <div style="display: flex; align-items: center; margin-bottom: 4px; font-size: 14px;">
            <span style="margin-right: 8px;">📞</span>
            <a href="tel:${sucursal.telefono}" style="color: #3b82f6; text-decoration: none;">${sucursal.telefono}</a>
          </div>
        ` : ''}
        ${sucursal.email ? `
          <div style="display: flex; align-items: center; margin-bottom: 8px; font-size: 14px;">
            <span style="margin-right: 8px;">✉️</span>
            <a href="mailto:${sucursal.email}" style="color: #3b82f6; text-decoration: none;">${sucursal.email}</a>
          </div>
        ` : ''}
        <button onclick="window.openDirections(${sucursal.latitud}, ${sucursal.longitud})" 
                style="background: #3b82f6; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 14px; margin-top: 8px;">
          🧭 Cómo llegar
        </button>
      </div>
    `;
  };

  const calculateRoute = (destination: Sucursal) => {
    if (!userLocation || !directionsService || !directionsRenderer) return;

    const request = {
      origin: userLocation,
      destination: { lat: Number(destination.latitud), lng: Number(destination.longitud) },
      travelMode: (window as any).google.maps.TravelMode.DRIVING
    };

    directionsService.route(request, (result: any, status: any) => {
      if (status === 'OK') {
        directionsRenderer.setDirections(result);
      }
    });
  };

  const openGoogleMapsDirections = (sucursal: Sucursal) => {
    if (userLocation) {
      const url = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${sucursal.latitud},${sucursal.longitud}`;
      window.open(url, '_blank');
    } else {
      const url = `https://www.google.com/maps/place/${sucursal.latitud},${sucursal.longitud}`;
      window.open(url, '_blank');
    }
  };

  // Función global para abrir direcciones desde InfoWindow
  useEffect(() => {
    (window as any).openDirections = (lat: number, lng: number) => {
      const sucursal = sucursalesConCoordenadas.find(s => 
        Number(s.latitud) === lat && Number(s.longitud) === lng
      );
      if (sucursal) {
        openGoogleMapsDirections(sucursal);
      }
    };

    return () => {
      if ((window as any).openDirections) {
        delete (window as any).openDirections;
      }
    };
  }, [userLocation, sucursalesConCoordenadas]);

  const formatHorario = (sucursal: Sucursal) => {
    const horarios = [
      { dia: 'Lun', horario: sucursal.horario_lunes },
      { dia: 'Mar', horario: sucursal.horario_martes },
      { dia: 'Mié', horario: sucursal.horario_miercoles },
      { dia: 'Jue', horario: sucursal.horario_jueves },
      { dia: 'Vie', horario: sucursal.horario_viernes },
      { dia: 'Sáb', horario: sucursal.horario_sabado },
      { dia: 'Dom', horario: sucursal.horario_domingo }
    ].filter(h => h.horario);

    return horarios.length > 0 ? horarios : null;
  };

  if (sucursalesConCoordenadas.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-8 text-center">
          <div className="text-gray-500">
            <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No hay ubicaciones disponibles</h3>
            <p>Agrega coordenadas a tus sucursales para mostrarlas en el mapa</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      <div 
        ref={mapRef} 
        style={{ height, width: '100%' }} 
        className="rounded-lg overflow-hidden shadow-lg"
      />

      {/* Información detallada de sucursal seleccionada */}
      {selectedSucursal && (
        <Card className="mt-4">
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-bold text-lg">{selectedSucursal.nombre}</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedSucursal(null)}
              >
                ×
              </Button>
            </div>
            
            <p className="text-gray-600 mb-3">{selectedSucursal.direccion}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Contacto
                </h4>
                {selectedSucursal.telefono && (
                  <p className="text-sm mb-1">
                    <a href={`tel:${selectedSucursal.telefono}`} className="text-blue-600 hover:underline">
                      {selectedSucursal.telefono}
                    </a>
                  </p>
                )}
                {selectedSucursal.email && (
                  <p className="text-sm">
                    <a href={`mailto:${selectedSucursal.email}`} className="text-blue-600 hover:underline">
                      {selectedSucursal.email}
                    </a>
                  </p>
                )}
              </div>
              
              {formatHorario(selectedSucursal) && (
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Horarios
                  </h4>
                  <div className="text-sm space-y-1">
                    {formatHorario(selectedSucursal)?.map((item, index) => (
                      <div key={index} className="flex justify-between">
                        <span className="font-medium">{item.dia}:</span>
                        <span>{item.horario}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-4 flex gap-2">
              <Button
                onClick={() => openGoogleMapsDirections(selectedSucursal)}
                className="flex-1"
              >
                <Navigation className="h-4 w-4 mr-2" />
                Cómo llegar
              </Button>
              <Button
                variant="outline"
                onClick={() => calculateRoute(selectedSucursal)}
                disabled={!userLocation}
              >
                <Navigation className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const url = `https://www.google.com/maps/place/${selectedSucursal.latitud},${selectedSucursal.longitud}`;
                  window.open(url, '_blank');
                }}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}