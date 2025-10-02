'use client';

import { Header } from '@/components/header';
import { NavigationBar } from '@/components/navigation-bar';
import { Mail, Phone, MapPin } from 'lucide-react';
import RichTextDisplay from '@/components/ui/rich-text-display';

interface EmpresaLayoutProps {
  children: React.ReactNode;
  empresa: {
    id: number;
    nombre_empresa: string;
    slug_empresa: string;
    descripcion_empresa?: string | null;
    correo_empresa?: string | null;
    telefono_empresa?: string | null;
    direccion_empresa?: string | null;
    logo_url?: string | null;
    logo_tamano?: string | null;
    logo_posicion?: 'izquierda' | 'centro' | 'derecha' | null;
    colores?: {
      primario?: { color: string };
      secundario?: { color: string };
      terciario?: { color: string };
      fondo?: { color: string };
    };
    categorias?: Array<{
      id: number;
      nombre: string;
    }>;
  };
  categoriaActiva?: string; // Slug de la categoría activa
}

export function EmpresaLayout({ children, empresa, categoriaActiva }: EmpresaLayoutProps) {

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header fijo en todas las páginas */}
      <Header empresa={empresa} />

      {/* Navegación de categorías fija */}
      {empresa.categorias && empresa.categorias.length > 0 && (
        <NavigationBar
          categorias={empresa.categorias}
          empresaSlug={empresa.slug_empresa}
          colorPrimario={empresa.colores?.primario?.color || '#2563eb'}
          categoriaActiva={categoriaActiva}
        />
      )}

      {/* Contenido principal */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer consistente */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="text-2xl font-bold mb-4">
              <RichTextDisplay content={empresa.nombre_empresa} />
            </div>
            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              {empresa.direccion_empresa && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{empresa.direccion_empresa}</span>
                </div>
              )}
              {empresa.telefono_empresa && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>{empresa.telefono_empresa}</span>
                </div>
              )}
              {empresa.correo_empresa && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>{empresa.correo_empresa}</span>
                </div>
              )}
            </div>
            <div className="mt-6 pt-6 border-t border-gray-800">
              <div className="text-gray-400 text-sm">
                © {new Date().getFullYear()} <RichTextDisplay content={empresa.nombre_empresa} className="inline" />. Todos los derechos reservados.
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
