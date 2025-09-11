'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Phone, Mail, Clock, MessageSquare } from 'lucide-react';
import type { Sucursal } from '@/lib/types/webgenerator';
import SimpleGoogleMap from '@/components/simple-google-map';

interface UbicacionesPageProps {
  empresaId: number;
  colorPrimario?: string;
  empresaNombre?: string;
}

export default function UbicacionesPage({ empresaId, colorPrimario = '#2563eb', empresaNombre = 'Nuestra Empresa' }: UbicacionesPageProps) {
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSucursales = async () => {
      try {
        setLoading(true);
        const supabase = createClient();
        
        const { data, error } = await supabase
          .from('sucursales')
          .select('*')
          .eq('empresa_id', empresaId)
          .eq('activo', true)
          .order('orden', { ascending: true });

        if (error) throw error;
        setSucursales(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar sucursales');
      } finally {
        setLoading(false);
      }
    };

    fetchSucursales();
  }, [empresaId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: colorPrimario }}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  if (sucursales.length === 0) {
    return (
      <div className="text-center py-12">
        <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No hay sucursales disponibles</h3>
        <p className="text-gray-500">Próximamente estaremos agregando más ubicaciones.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Encabezado */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Nuestras Ubicaciones</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Visítanos en cualquiera de nuestras sucursales. Te ofrecemos atención personalizada y profesional.
        </p>
      </div>

      {/* Layout horizontal: Lista de ubicaciones a la izquierda, mapa a la derecha */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Lista de sucursales - Izquierda */}
        <div className="space-y-6">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">Todas nuestras sucursales</h3>
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {sucursales.map((sucursal) => (
              <Card key={sucursal.id} className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  {/* Nombre de la sucursal */}
                  <div className="mb-4">
                    <h4 className="text-xl font-bold text-gray-800 mb-2">{sucursal.nombre}</h4>
                    <div className="flex items-start gap-2 text-gray-600">
                      <MapPin className="h-5 w-5 mt-0.5 flex-shrink-0" style={{ color: colorPrimario }} />
                      <p className="text-sm leading-relaxed">{sucursal.direccion}</p>
                    </div>
                  </div>

                  {/* Información de contacto */}
                  <div className="space-y-3 mb-4">
                    {sucursal.telefono && (
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4" style={{ color: colorPrimario }} />
                        <a 
                          href={`tel:${sucursal.telefono}`}
                          className="text-sm hover:underline transition-colors"
                          style={{ color: colorPrimario }}
                        >
                          {sucursal.telefono}
                        </a>
                      </div>
                    )}

                    {sucursal.whatsapp && (
                      <div className="flex items-center gap-3">
                        <MessageSquare className="h-4 w-4 text-green-600" />
                        <a 
                          href={`https://wa.me/${sucursal.whatsapp.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-green-600 hover:underline transition-colors"
                        >
                          WhatsApp: {sucursal.whatsapp}
                        </a>
                      </div>
                    )}

                    {sucursal.email && (
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4" style={{ color: colorPrimario }} />
                        <a 
                          href={`mailto:${sucursal.email}`}
                          className="text-sm hover:underline transition-colors"
                          style={{ color: colorPrimario }}
                        >
                          {sucursal.email}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Horarios */}
                  <div className="border-t pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="h-4 w-4" style={{ color: colorPrimario }} />
                      <span className="text-sm font-medium text-gray-700">Horarios de Atención</span>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-1 text-xs text-gray-600">
                      {[
                        { key: 'horario_lunes', label: 'Lunes' },
                        { key: 'horario_martes', label: 'Martes' },
                        { key: 'horario_miercoles', label: 'Miércoles' },
                        { key: 'horario_jueves', label: 'Jueves' },
                        { key: 'horario_viernes', label: 'Viernes' },
                        { key: 'horario_sabado', label: 'Sábado' },
                        { key: 'horario_domingo', label: 'Domingo' }
                      ].map(({ key, label }) => {
                        const horario = sucursal[key as keyof Sucursal] as string;
                        if (!horario) return null;
                        
                        return (
                          <div key={key} className="flex justify-between">
                            <span className="font-medium">{label}:</span>
                            <span>{horario}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Coordenadas para desarrollo (opcional) */}
                  {process.env.NODE_ENV === 'development' && sucursal.latitud && sucursal.longitud && (
                    <div className="border-t pt-3 mt-3">
                      <p className="text-xs text-gray-400">
                        Coordenadas: {sucursal.latitud.toFixed(6)}, {sucursal.longitud.toFixed(6)}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Mapa - Derecha */}
        <div className="lg:sticky lg:top-8 lg:h-fit">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">Ubicación en el mapa</h3>
          <div className="h-[600px] w-full">
            <SimpleGoogleMap 
              sucursales={sucursales} 
              colorPrimario={colorPrimario}
            />
          </div>
        </div>
      </div>

      {/* Mensaje adicional */}
      <div className="text-center pt-8 border-t">
        <p className="text-gray-600">
          ¿No encuentras una sucursal cerca de ti? 
          <span className="font-medium ml-1">¡Contáctanos!</span> Estamos expandiendo nuestras ubicaciones.
        </p>
      </div>
    </div>
  );
}
