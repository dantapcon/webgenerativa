import { useState, useEffect } from 'react';
import { AlertCircle, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export function MigracionAdvertencia() {
  const [mostrarAviso, setMostrarAviso] = useState<boolean>(false);

  useEffect(() => {
    // Verificar si ya se mostró la advertencia y el usuario la descartó
    const avisoDismissed = localStorage.getItem('migracionAvisoDismissed');
    if (!avisoDismissed) {
      setMostrarAviso(true);
    }
  }, []);

  if (!mostrarAviso) return null;

  return (
    <div className="fixed bottom-4 right-4 max-w-md bg-amber-50 border-l-4 border-amber-500 p-4 rounded shadow-lg z-50">
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-6 w-6 text-amber-500" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-amber-800">
            ⚠️ Actualización de base de datos requerida
          </h3>
          <div className="mt-2 text-sm text-amber-700">
            <p>
              Se han añadido nuevas funcionalidades que requieren una actualización de la base de datos.
              Por favor, ejecuta el script de migración siguiendo las instrucciones en el archivo <code>INSTRUCCIONES_MIGRACION.md</code>.
            </p>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => {
                localStorage.setItem('migracionAvisoDismissed', 'true');
                setMostrarAviso(false);
              }}
              className="text-sm text-amber-700 hover:text-amber-600"
            >
              Entendido
            </button>
            <span className="text-amber-500">|</span>
            <a 
              href="https://github.com/dantapcon/webgenerativa/blob/main/INSTRUCCIONES_MIGRACION.md" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-amber-700 hover:text-amber-600 underline"
            >
              Ver instrucciones
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
