'use client';

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Sucursal } from '@/lib/types/webgenerator';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Loader2 } from 'lucide-react';

// Importar componentes de mapa dinámicamente para evitar problemas de SSR
const GoogleMapStoresEnhanced = dynamic(
  () => import('@/components/GoogleMapStoresEnhanced'),
  { 
    ssr: false,
    loading: () => <MapLoadingComponent />
  }
);

const OpenStreetMapStores = dynamic(
  () => import('@/components/OpenStreetMapStores'),
  { 
    ssr: false,
    loading: () => <MapLoadingComponent />
  }
);

interface UniversalMapProps {
  sucursales: Sucursal[];
  tipoMapa: 'google' | 'openstreetmap' | null;
  className?: string;
  height?: string;
  zoom?: number;
  empresa?: {
    nombre_empresa: string;
    telefono_empresa?: string;
    correo_empresa?: string;
  };
}

// Componente de loading para mapas
function MapLoadingComponent() {
  return (
    <Card className="w-full">
      <CardContent className="p-8">
        <div className="flex flex-col items-center justify-center text-gray-500">
          <div className="flex items-center gap-3 mb-4">
            <Loader2 className="h-6 w-6 animate-spin" />
            <MapPin className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-medium mb-2">Cargando mapa...</h3>
          <p className="text-sm text-center">
            Preparando la vista de ubicaciones de sucursales
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// Componente de error/fallback
function MapErrorComponent({ tipoMapa }: { tipoMapa: string }) {
  return (
    <Card className="w-full">
      <CardContent className="p-8 text-center">
        <div className="text-gray-500">
          <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">Error cargando mapa</h3>
          <p className="text-sm mb-2">
            No se pudo cargar el mapa {tipoMapa === 'google' ? 'Google Maps' : 'OpenStreetMap'}
          </p>
          <p className="text-xs text-gray-400">
            Verifica tu conexión a internet e intenta recargar la página
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// Componente para cuando no hay tipo de mapa configurado
function MapNotConfiguredComponent() {
  return (
    <Card className="w-full">
      <CardContent className="p-8 text-center">
        <div className="text-gray-500">
          <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">Mapa no configurado</h3>
          <p className="text-sm">
            El administrador debe configurar el tipo de mapa en la configuración de la empresa
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function UniversalMap({ 
  sucursales, 
  tipoMapa, 
  className = "", 
  height = "400px",
  zoom = 13,
  empresa
}: UniversalMapProps) {
  // Si no hay tipo de mapa configurado, usar Google Maps por defecto
  const mapType = tipoMapa || 'google';

  // Si no hay sucursales, mostrar mensaje
  if (!sucursales || sucursales.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-8 text-center">
          <div className="text-gray-500">
            <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No hay sucursales</h3>
            <p className="text-sm">
              Esta empresa aún no ha agregado sucursales para mostrar en el mapa
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Si no hay tipo configurado, mostrar mensaje
  if (!tipoMapa) {
    return <MapNotConfiguredComponent />;
  }

  const mapProps = {
    sucursales,
    className,
    height,
    zoom,
    empresa
  };

  return (
    <div className={className}>
      <Suspense fallback={<MapLoadingComponent />}>
        {mapType === 'google' ? (
          <GoogleMapStoresEnhanced {...mapProps} />
        ) : mapType === 'openstreetmap' ? (
          <OpenStreetMapStores {...mapProps} />
        ) : (
          <MapErrorComponent tipoMapa={mapType} />
        )}
      </Suspense>

      {/* Información del proveedor de mapa */}
      <div className="mt-2 text-xs text-gray-500 flex items-center justify-between">
        <span>
          Mapas proporcionados por {mapType === 'google' ? 'Google Maps' : 'OpenStreetMap'}
        </span>
        <div className="flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          <span>{sucursales.length} ubicacion{sucursales.length !== 1 ? 'es' : ''}</span>
        </div>
      </div>
    </div>
  );
}

// Hook personalizado para detectar tipo de mapa
export function useMapType(empresa?: { tipo_mapa?: 'google' | 'openstreetmap' | null }) {
  return empresa?.tipo_mapa || 'google';
}

// Función de utilidad para validar configuración de mapa
export function isMapConfigurationValid(tipoMapa: 'google' | 'openstreetmap' | null): boolean {
  if (!tipoMapa) return false;
  
  if (tipoMapa === 'google') {
    return !!(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);
  }
  
  if (tipoMapa === 'openstreetmap') {
    return true; // OpenStreetMap no requiere API key
  }
  
  return false;
}

// Componente de información de configuración para administradores
export function MapConfigurationInfo({ tipoMapa }: { tipoMapa: 'google' | 'openstreetmap' | null }) {
  const isValid = isMapConfigurationValid(tipoMapa);
  
  if (!tipoMapa) {
    return (
      <div className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
        ⚠️ No se ha configurado un proveedor de mapas para esta empresa
      </div>
    );
  }
  
  if (!isValid && tipoMapa === 'google') {
    return (
      <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
        ❌ Google Maps requiere una API key válida en las variables de entorno
      </div>
    );
  }
  
  return (
    <div className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg p-3">
      ✅ Configuración de mapas válida: {tipoMapa === 'google' ? 'Google Maps' : 'OpenStreetMap'}
    </div>
  );
}