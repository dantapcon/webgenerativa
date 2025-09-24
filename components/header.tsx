'use client';

import { Mail, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { processImageUrl } from '@/lib/utils/image-url';

interface HeaderProps {
  empresa?: {
    nombre_empresa: string;
    slug_empresa?: string;
    logo_url?: string | null;
    logo_tamano?: string | null;
    logo_tamano_px?: number | null;
    logo_posicion?: 'izquierda' | 'centro' | 'derecha' | null;
    titulo_tamano?: number | null;
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
    logo_tamano_px: 48,
    logo_posicion: 'izquierda',
    titulo_tamano: 32,
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
              <div className="relative" style={{
                width: `${empresaData.logo_tamano_px || 48}px`,
                height: `${empresaData.logo_tamano_px || 48}px`
              }}>
                <Image
                  src={processImageUrl(empresaData.logo_url)}
                  alt={`Logo ${empresaData.nombre_empresa}`}
                  fill
                  className="object-contain"
                  onError={(e) => {
                    console.error("Error cargando logo en header:", e);
                    // @ts-expect-error - Ignorar error de tipos para este caso específico
                    e.target.src = "https://placehold.co/400x300?text=Logo+no+disponible";
                  }}
                />
              </div>
            )}
            <div>
              <h1 className="font-bold" style={{ 
                color: empresaData.color_primario || '#2563eb',
                fontFamily: `'${empresaData.tipografia}', sans-serif`,
                fontSize: `${empresaData.titulo_tamano || 32}px`
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
              </div>
            )}
            <Button
              asChild
              size="sm"
              variant="outline"
              className="border-2 hover:bg-gray-50"
              style={{ 
                borderColor: empresaData.color_primario || '#2563eb',
                color: empresaData.color_primario || '#2563eb'
              }}
            >
              <Link href="/auth/login">
                Iniciar Sesión
              </Link>
            </Button>
          </div>
        </div>

        {/* Versión móvil del contacto */}
        <div className="md:hidden mt-4 flex flex-col gap-3">
          {empresaData.telefono_empresa && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" style={{ color: empresaData.color_primario || '#2563eb' }} />
              <span className="text-sm text-gray-500">Citas</span>
            </div>
          )}
          <div className="flex justify-center">
            <Button
              asChild
              size="sm"
              variant="outline"
              className="border-2 hover:bg-gray-50"
              style={{ 
                borderColor: empresaData.color_primario || '#2563eb',
                color: empresaData.color_primario || '#2563eb'
              }}
            >
              <Link href="/auth/login">
                Iniciar Sesión
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
