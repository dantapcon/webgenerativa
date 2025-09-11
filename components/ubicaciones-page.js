'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Phone, Mail, Clock, MessageSquare } from 'lucide-react';
import SimpleGoogleMap from '@/components/simple-google-map';

/**
 * @typedef {Object} Sucursal
 * @property {number} id
 * @property {string} nombre
 * @property {string} direccion
 * @property {string} telefono
 * @property {string} horario
 * @property {number} latitud
 * @property {number} longitud
 * @property {boolean} activo
 */

/**
 * Componente para mostrar las ubicaciones/sucursales de una empresa
 * @param {Object} props - Propiedades del componente
 * @param {number} props.empresaId - ID de la empresa
 * @param {string} props.colorPrimario - Color primario de la empresa
 * @param {string} props.empresaNombre - Nombre de la empresa
 */
export default function UbicacionesPage({ empresaId, colorPrimario = '#2563eb', empresaNombre = 'Nuestra Empresa' }) {
  const [sucursales, setSucursales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSucursales = async () => {
      try {
        const supabase = createClient();
        
        const { data, error } = await supabase
          .from('sucursales')
          .select('*')
          .eq('empresa_id', empresaId)
          .eq('activo', true)
          .order('nombre');

        if (error) {
          throw error;
        }

        setSucursales(data || []);
      } catch (err) {
        console.error('Error fetching sucursales:', err);
        setError(err.message || 'Error al cargar las sucursales');
      } finally {
        setLoading(false);
      }
    };

    if (empresaId) {
      fetchSucursales();
    }
  }, [empresaId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center p-8 bg-red-50 rounded-lg border border-red-200">
          <div className="text-4xl mb-4">❌</div>
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error al cargar ubicaciones</h2>
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  if (sucursales.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6" style={{ color: colorPrimario }}>
          Nuestras Ubicaciones
        </h1>
        <div className="text-center p-8 bg-gray-50 rounded-lg border">
          <div className="text-4xl mb-4">📍</div>
          <h2 className="text-xl font-semibold text-gray-600 mb-2">No hay ubicaciones disponibles</h2>
          <p className="text-gray-500">
            {empresaNombre} aún no ha registrado sus ubicaciones.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6" style={{ color: colorPrimario }}>
        Nuestras Ubicaciones
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Lista de sucursales */}
        <div className="space-y-4">
          {sucursales.map((sucursal) => (
            <Card key={sucursal.id} className="border-l-4" style={{ borderLeftColor: colorPrimario }}>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4" style={{ color: colorPrimario }}>
                  {sucursal.nombre}
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 mt-1 flex-shrink-0" style={{ color: colorPrimario }} />
                    <div>
                      <p className="font-medium text-gray-700">Dirección</p>
                      <p className="text-gray-600">{sucursal.direccion}</p>
                    </div>
                  </div>

                  {sucursal.telefono && (
                    <div className="flex items-start space-x-3">
                      <Phone className="w-5 h-5 mt-1 flex-shrink-0" style={{ color: colorPrimario }} />
                      <div>
                        <p className="font-medium text-gray-700">Teléfono</p>
                        <a 
                          href={`tel:${sucursal.telefono}`}
                          className="text-gray-600 hover:text-blue-600 transition-colors"
                        >
                          {sucursal.telefono}
                        </a>
                      </div>
                    </div>
                  )}

                  {sucursal.email && (
                    <div className="flex items-start space-x-3">
                      <Mail className="w-5 h-5 mt-1 flex-shrink-0" style={{ color: colorPrimario }} />
                      <div>
                        <p className="font-medium text-gray-700">Email</p>
                        <a 
                          href={`mailto:${sucursal.email}`}
                          className="text-gray-600 hover:text-blue-600 transition-colors"
                        >
                          {sucursal.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {sucursal.horario && (
                    <div className="flex items-start space-x-3">
                      <Clock className="w-5 h-5 mt-1 flex-shrink-0" style={{ color: colorPrimario }} />
                      <div>
                        <p className="font-medium text-gray-700">Horario de atención</p>
                        {/* Procesar horario - puede ser texto plano o JSON */}
                        {(() => {
                          try {
                            // Intentar parsear como JSON primero
                            const horarioObj = JSON.parse(sucursal.horario);
                            return (
                              <div className="text-gray-600 space-y-1">
                                {Object.entries(horarioObj).map(([dia, horario]) => (
                                  <div key={dia} className="flex justify-between">
                                    <span className="capitalize">{dia}:</span>
                                    <span>{horario}</span>
                                  </div>
                                ))}
                              </div>
                            );
                          } catch {
                            // Si no es JSON válido, mostrar como texto plano
                            return <p className="text-gray-600">{sucursal.horario}</p>;
                          }
                        })()}
                      </div>
                    </div>
                  )}

                  {/* Botón de contacto directo */}
                  {sucursal.telefono && (
                    <div className="pt-2">
                      <a 
                        href={`https://wa.me/${sucursal.telefono.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-2 text-white px-4 py-2 rounded-lg transition-colors hover:opacity-90"
                        style={{ backgroundColor: colorPrimario }}
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Contactar vía WhatsApp</span>
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mapa */}
        <div className="lg:sticky lg:top-8 h-fit">
          <Card>
            <CardContent className="p-0">
              <div className="h-96 rounded-lg overflow-hidden">
                <SimpleGoogleMap 
                  sucursales={sucursales} 
                  colorPrimario={colorPrimario}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}