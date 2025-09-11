'use client';

import { useEffect, useState } from 'react';
import SimpleGoogleMap from '@/components/simple-google-map';

export default function TestMapsPage() {
  const [testSucursales] = useState([
    {
      id: 1,
      nombre: "Sucursal Centro",
      direccion: "Av. Principal 123, Centro",
      telefono: "555-0123",
      horario: "L-V: 9:00-18:00",
      latitud: -34.6037,
      longitud: -58.3816,
      activo: true
    },
    {
      id: 2,
      nombre: "Sucursal Norte",
      direccion: "Av. Norte 456, Zona Norte",
      telefono: "555-0456",
      horario: "L-S: 8:00-20:00",
      latitud: -34.5500,
      longitud: -58.4500,
      activo: true
    }
  ]);

  const [apiKeyStatus, setApiKeyStatus] = useState('Verificando...');

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      setApiKeyStatus('❌ No configurada');
    } else if (apiKey.includes('YOUR_API_KEY') || apiKey.length < 30) {
      setApiKeyStatus('❌ Parece inválida');
    } else {
      setApiKeyStatus('✅ Configurada');
    }
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Test Google Maps API</h1>
        
        {/* Estado de la API Key */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Estado de la API Key</h2>
          <p className="text-lg">
            <strong>Google Maps API Key:</strong> {apiKeyStatus}
          </p>
          {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && (
            <p className="text-sm text-gray-600 mt-2">
              Key: {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.substring(0, 20)}...
            </p>
          )}
        </div>

        {/* Mapa de prueba */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Mapa de Prueba</h2>
          <div className="h-[400px]">
            <SimpleGoogleMap 
              sucursales={testSucursales}
              colorPrimario="#2563eb"
            />
          </div>
        </div>

        {/* Instrucciones */}
        <div className="bg-blue-50 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold mb-3">Instrucciones de Prueba</h3>
          <ul className="list-disc list-inside space-y-2 text-sm">
            <li>Verifica que la API Key esté configurada correctamente</li>
            <li>El mapa debería cargar y mostrar dos marcadores en Buenos Aires</li>
            <li>Haz clic en los marcadores para ver la información</li>
            <li>No deberías ver errores en la consola del navegador</li>
          </ul>
        </div>
      </div>
    </div>
  );
}