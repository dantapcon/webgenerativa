'use client';

import { processImageUrl } from '@/lib/utils/image-url';

export default function TestImagePage() {
  const testUrls = [
    'https://drive.google.com/file/d/1EC3tqUgwRj_DNdsjKr8Mjo9G-WE9G3cw/view',
    'https://drive.google.com/open?id=1EC3tqUgwRj_DNdsjKr8Mjo9G-WE9G3cw',
    'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=500',
    'https://via.placeholder.com/500x300'
  ];

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Prueba de URLs de Imagen</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {testUrls.map((url, index) => (
          <div key={index} className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2">URL #{index + 1}</h3>
            <p className="text-sm text-gray-600 mb-2 break-all">
              <strong>Original:</strong> {url}
            </p>
            <p className="text-sm text-gray-600 mb-4 break-all">
              <strong>Procesada:</strong> {processImageUrl(url)}
            </p>
            <div className="border rounded overflow-hidden">
              <img 
                src={processImageUrl(url)} 
                alt={`Imagen de prueba ${index + 1}`}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/500x300/cccccc/666666?text=Error+al+cargar';
                }}
                onLoad={() => {
                  console.log(`Imagen ${index + 1} cargada correctamente`);
                }}
              />
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Instrucciones para usar Google Drive:</h3>
        <ol className="list-decimal list-inside space-y-2">
          <li>Sube tu imagen a Google Drive</li>
          <li>Haz clic derecho en el archivo → "Compartir"</li>
          <li>Cambia los permisos a "Cualquier persona con el enlace"</li>
          <li>Copia el enlace completo (formato: https://drive.google.com/file/d/ID/view)</li>
          <li>Pégalo en el campo de imagen - se convertirá automáticamente</li>
        </ol>
      </div>
    </div>
  );
}