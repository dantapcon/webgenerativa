'use client';

import { Mail, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';

// Función para convertir URLs de Google Drive en enlaces directos
function formatGoogleDriveUrl(url: string): string {
  try {
    if (!url || !url.includes('drive.google.com')) return url;
    
    // Extraer el ID del archivo de Google Drive
    let fileId = '';
    
    // Formato: drive.google.com/file/d/ID/view
    if (url.includes('/file/d/')) {
      const parts = url.split('/file/d/');
      if (parts.length > 1) {
        fileId = parts[1].split('/')[0];
      }
    }
    // Formato: drive.google.com/open?id=ID
    else if (url.includes('open?id=')) {
      const urlObj = new URL(url);
      fileId = urlObj.searchParams.get('id') || '';
    }
    
    if (!fileId) return url;
    
    // MÉTODO PROBADO Y CONFIRMADO: Formato correcto para imágenes de Google Drive
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
  } catch (error) {
    console.error('Error formateando URL de Google Drive:', error);
    return url;
  }
}

interface HeaderProps {
  empresa?: {
    nombre_empresa: string;
    logo_url?: string | null;
    logo_tamano?: string | null;
    logo_posicion?: 'izquierda' | 'centro' | 'derecha' | null;
    direccion_empresa?: string | null;
    telefono_empresa?: string | null;
    correo_empresa?: string | null;
    color_primario?: string | null;
    tipografia?: string | null;
  };
}

export function Header({ empresa }: HeaderProps) {
  // Valores por defecto si no se proporciona empresa
  const defaultEmpresa = {
    nombre_empresa: 'WebGenerator Pro',
    logo_url: null,
    logo_tamano: 'mediano',
    logo_posicion: 'izquierda',
    direccion_empresa: null,
    telefono_empresa: null,
    correo_empresa: null,
    color_primario: '#2563eb',
    tipografia: 'Inter'
  };

  const empresaData = empresa || defaultEmpresa;
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo y nombre */}
          <div className={`flex items-center gap-4 ${
            empresaData.logo_posicion === 'centro' ? 'mx-auto' : 
            empresaData.logo_posicion === 'derecha' ? 'ml-auto' : ''
          }`}>
            {empresaData.logo_url && (
              <div className={`relative ${
                empresaData.logo_tamano === 'pequeno' ? 'w-12 h-12' : 
                empresaData.logo_tamano === 'grande' ? 'w-24 h-24' : 
                'w-16 h-16'
              }`}>
                <Image
                  src={empresaData.logo_url.includes('drive.google.com') ? 
                    formatGoogleDriveUrl(empresaData.logo_url) : 
                    empresaData.logo_url}
                  alt={`Logo ${empresaData.nombre_empresa}`}
                  fill
                  className="object-contain"
                  onError={(e) => {
                    console.error("Error cargando logo en header:", e);
                    // @ts-ignore - Ignorar error de tipos para este caso específico
                    e.target.src = "https://placehold.co/400x300?text=Logo+no+disponible";
                  }}
                />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold" style={{ 
                color: empresaData.color_primario || '#2563eb',
                fontFamily: `'${empresaData.tipografia}', sans-serif`
              }}>
                {empresaData.nombre_empresa}
              </h1>
              {empresaData.direccion_empresa && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" style={{ color: empresaData.color_primario || '#2563eb' }} />
                  <span>{empresaData.direccion_empresa}</span>
                </div>
              )}
            </div>
          </div>

          {/* Información de contacto */}
          <div className="hidden md:flex items-center gap-6">
            {empresaData.telefono_empresa && (
              <div className="text-right">
                <div className="flex items-center gap-2 justify-end">
                  <Phone className="h-4 w-4" style={{ color: empresaData.color_primario || '#2563eb' }} />
                  <span className="text-sm text-gray-500">Citas</span>
                </div>
                <p className="font-semibold" style={{ color: empresaData.color_primario || '#2563eb' }}>
                  {empresaData.telefono_empresa}
                </p>
              </div>
            )}
            <Button
              asChild
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2"
            >
              <Link 
                href="/dashboard"
                className="flex items-center gap-2"
              >
                Volver al Inicio
              </Link>
            </Button>
          </div>
        </div>

        {/* Versión móvil del contacto */}
        <div className="md:hidden mt-4 flex flex-col gap-3">
          {empresaData.telefono_empresa && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" style={{ color: empresaData.color_primario || '#2563eb' }} />
                <span className="font-semibold" style={{ color: empresaData.color_primario || '#2563eb' }}>
                  {empresaData.telefono_empresa}
                </span>
              </div>
              <Button
                asChild
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Link 
                  href="/dashboard"
                >
                  Volver al Inicio
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
