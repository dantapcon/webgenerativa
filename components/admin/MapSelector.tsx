'use client';

import React from 'react';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Map, Navigation, Globe } from 'lucide-react';

interface MapSelectorProps {
  value: 'google' | 'openstreetmap' | null;
  onChange: (value: 'google' | 'openstreetmap') => void;
  className?: string;
}

export default function MapSelector({ value, onChange, className = "" }: MapSelectorProps) {
  const mapOptions = [
    {
      id: 'google',
      name: 'Google Maps',
      description: 'Mapa de Google con navegación y street view',
      icon: Globe,
      features: ['Navegación GPS', 'Street View', 'Información de tráfico', 'Fotos de lugares']
    },
    {
      id: 'openstreetmap',
      name: 'OpenStreetMap',
      description: 'Mapa colaborativo open source',
      icon: Map,
      features: ['Código abierto', 'Sin límites de uso', 'Datos actualizados por la comunidad', 'Mayor privacidad']
    }
  ] as const;

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <Navigation className="h-5 w-5 text-blue-600" />
        <Label className="text-base font-medium">Proveedor de Mapas</Label>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mapOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = value === option.id;
          
          return (
            <Card 
              key={option.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                isSelected 
                  ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50' 
                  : 'hover:border-gray-300'
              }`}
              onClick={() => onChange(option.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    isSelected ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{option.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {option.description}
                    </CardDescription>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    isSelected 
                      ? 'border-blue-500 bg-blue-500' 
                      : 'border-gray-300'
                  }`}>
                    {isSelected && (
                      <div className="w-full h-full rounded-full bg-white scale-50"></div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-1">
                  {option.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                      {feature}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {value && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            <span className="font-medium">Seleccionado:</span> {mapOptions.find(opt => opt.id === value)?.name}
          </p>
        </div>
      )}
    </div>
  );
}