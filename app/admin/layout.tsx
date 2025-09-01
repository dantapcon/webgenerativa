import { Building, Globe, Home, Settings, Users, BarChart3 } from 'lucide-react';
import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navegación superior */}
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-2 font-bold text-xl text-blue-600">
                <Globe className="h-6 w-6" />
                WebGenerator Pro
              </Link>
              <div className="hidden md:flex items-center gap-6">
                <Link 
                  href="/admin/empresas" 
                  className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <Building className="h-4 w-4" />
                  Administrar Sitios
                </Link>
                <Link 
                  href="/admin/estadisticas" 
                  className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <BarChart3 className="h-4 w-4" />
                  Estadísticas
                </Link>
                <Link 
                  href="/generador" 
                  className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <Globe className="h-4 w-4" />
                  Crear Nuevo
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link 
                href="/" 
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Home className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Contenido */}
      <main>
        {children}
      </main>
    </div>
  );
}
