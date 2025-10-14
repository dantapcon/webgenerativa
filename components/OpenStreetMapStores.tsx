'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon, divIcon } from 'leaflet';
import { Sucursal } from '@/lib/types/webgenerator';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, Mail, Navigation, Clock, ExternalLink } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix para iconos de Leaflet en Next.js
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface OpenStreetMapStoresProps {
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

// Componente para manejar la ubicación del usuario
function UserLocationHandler({ onLocationFound }: { onLocationFound: (lat: number, lng: number) => void }) {
  const map = useMap();

  useEffect(() => {
    map.locate({
      setView: false,
      maxZoom: 16
    });

    map.on('locationfound', (e) => {
      onLocationFound(e.latlng.lat, e.latlng.lng);
    });

    return () => {
      map.off('locationfound');
    };
  }, [map, onLocationFound]);

  return null;
}

export default function OpenStreetMapStores({ 
  sucursales, 
  className = "", 
  height = "400px",
  zoom = 13,
  empresa
}: OpenStreetMapStoresProps) {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedSucursal, setSelectedSucursal] = useState<Sucursal | null>(null);

  // Filtrar sucursales que tienen coordenadas válidas
  const sucursalesConCoordenadas = sucursales.filter(
    sucursal => sucursal.latitud && sucursal.longitud
  );

  if (sucursalesConCoordenadas.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-8 text-center">
          <div className="text-gray-500">
            <Navigation className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No hay ubicaciones disponibles</h3>
            <p>Agrega coordenadas a tus sucursales para mostrarlas en el mapa</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calcular centro del mapa basado en las sucursales
  const centerLat = sucursalesConCoordenadas.reduce((sum, s) => sum + Number(s.latitud), 0) / sucursalesConCoordenadas.length;
  const centerLng = sucursalesConCoordenadas.reduce((sum, s) => sum + Number(s.longitud), 0) / sucursalesConCoordenadas.length;

  // Crear icono personalizado para sucursales
  const createCustomIcon = (color: string = '#e74c3c') => {
    return divIcon({
      html: `
        <div style="
          background: ${color};
          width: 30px;
          height: 30px;
          border-radius: 50% 50% 50% 0;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            transform: rotate(45deg);
            color: white;
            font-size: 14px;
            font-weight: bold;
          ">📍</div>
        </div>
      `,
      className: 'custom-marker',
      iconSize: [30, 30],
      iconAnchor: [15, 30],
      popupAnchor: [0, -30]
    });
  };

  // Crear icono para ubicación del usuario
  const userIcon = divIcon({
    html: `
      <div style="
        background: #3b82f6;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        animation: pulse 2s infinite;
      "></div>
      <style>
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
          100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
        }
      </style>
    `,
    className: 'user-location-marker',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });

  const handleLocationFound = (lat: number, lng: number) => {
    setUserLocation({ lat, lng });
  };

  const openDirections = (sucursal: Sucursal) => {
    if (userLocation) {
      // Usar OpenStreetMap directions
      const url = `https://www.openstreetmap.org/directions?from=${userLocation.lat},${userLocation.lng}&to=${sucursal.latitud},${sucursal.longitud}`;
      window.open(url, '_blank');
    } else {
      // Si no hay ubicación del usuario, abrir solo la ubicación de la sucursal
      const url = `https://www.openstreetmap.org/?mlat=${sucursal.latitud}&mlon=${sucursal.longitud}&zoom=16`;
      window.open(url, '_blank');
    }
  };

  const formatHorario = (sucursal: Sucursal) => {
    const horarios = [
      { dia: 'Lunes', horario: sucursal.horario_lunes },
      { dia: 'Martes', horario: sucursal.horario_martes },
      { dia: 'Miércoles', horario: sucursal.horario_miercoles },
      { dia: 'Jueves', horario: sucursal.horario_jueves },
      { dia: 'Viernes', horario: sucursal.horario_viernes },
      { dia: 'Sábado', horario: sucursal.horario_sabado },
      { dia: 'Domingo', horario: sucursal.horario_domingo }
    ].filter(h => h.horario);

    return horarios.length > 0 ? horarios : null;
  };

  return (
    <div className={className}>
      <div style={{ height, width: '100%' }} className="rounded-lg overflow-hidden shadow-lg">
        <MapContainer
          center={[centerLat, centerLng]}
          zoom={zoom}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <UserLocationHandler onLocationFound={handleLocationFound} />
          
          {/* Marcador de ubicación del usuario */}
          {userLocation && (
            <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
              <Popup>
                <div className="text-center">
                  <p className="font-medium text-blue-600">Tu ubicación</p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Marcadores de sucursales */}
          {sucursalesConCoordenadas.map((sucursal) => (
            <Marker
              key={sucursal.id}
              position={[Number(sucursal.latitud), Number(sucursal.longitud)]}
              icon={createCustomIcon()}
              eventHandlers={{
                click: () => setSelectedSucursal(sucursal)
              }}
            >
              <Popup maxWidth={300}>
                <div className="p-2">
                  <h3 className="font-bold text-lg mb-2">{sucursal.nombre}</h3>
                  <p className="text-gray-600 mb-3">{sucursal.direccion}</p>
                  
                  <div className="space-y-2 mb-3">
                    {sucursal.telefono && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-blue-600" />
                        <a href={`tel:${sucursal.telefono}`} className="text-blue-600 hover:underline">
                          {sucursal.telefono}
                        </a>
                      </div>
                    )}
                    
                    {sucursal.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-blue-600" />
                        <a href={`mailto:${sucursal.email}`} className="text-blue-600 hover:underline">
                          {sucursal.email}
                        </a>
                      </div>
                    )}
                  </div>

                  <Button
                    size="sm"
                    onClick={() => openDirections(sucursal)}
                    className="w-full"
                  >
                    <Navigation className="h-4 w-4 mr-2" />
                    Cómo llegar
                  </Button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

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
                onClick={() => openDirections(selectedSucursal)}
                className="flex-1"
              >
                <Navigation className="h-4 w-4 mr-2" />
                Cómo llegar
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const url = `https://www.openstreetmap.org/?mlat=${selectedSucursal.latitud}&mlon=${selectedSucursal.longitud}&zoom=16`;
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