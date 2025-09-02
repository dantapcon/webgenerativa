import { Mail, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface HeaderProps {
  empresa: {
    nombre_empresa: string;
    logo_url?: string | null;
    direccion_empresa?: string | null;
    telefono_empresa?: string | null;
    correo_empresa?: string | null;
    color_primario?: string | null;
    tipografia?: string | null;
  };
}

export function Header({ empresa }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo y nombre */}
          <div className="flex items-center gap-4">
            {empresa.logo_url && (
              <div className="relative w-16 h-16">
                <Image
                  src={empresa.logo_url}
                  alt={`Logo ${empresa.nombre_empresa}`}
                  fill
                  className="object-contain"
                />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold" style={{ 
                color: empresa.color_primario || '#2563eb',
                fontFamily: `'${empresa.tipografia}', sans-serif`
              }}>
                {empresa.nombre_empresa}
              </h1>
              {empresa.direccion_empresa && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" style={{ color: empresa.color_primario || '#2563eb' }} />
                  <span>{empresa.direccion_empresa}</span>
                </div>
              )}
            </div>
          </div>

          {/* Información de contacto */}
          <div className="hidden md:flex items-center gap-6">
            {empresa.telefono_empresa && (
              <div className="text-right">
                <div className="flex items-center gap-2 justify-end">
                  <Phone className="h-4 w-4" style={{ color: empresa.color_primario || '#2563eb' }} />
                  <span className="text-sm text-gray-500">Citas</span>
                </div>
                <p className="font-semibold" style={{ color: empresa.color_primario || '#2563eb' }}>
                  {empresa.telefono_empresa}
                </p>
              </div>
            )}
            <Button
              asChild
              className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-2"
            >
              <a 
                href={`https://wa.me/${(empresa.telefono_empresa || '').replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                📱 Asistencia WhatsApp
              </a>
            </Button>
          </div>
        </div>

        {/* Versión móvil del contacto */}
        <div className="md:hidden mt-4 flex flex-col gap-3">
          {empresa.telefono_empresa && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" style={{ color: empresa.color_primario || '#2563eb' }} />
                <span className="font-semibold" style={{ color: empresa.color_primario || '#2563eb' }}>
                  {empresa.telefono_empresa}
                </span>
              </div>
              <Button
                asChild
                size="sm"
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                <a 
                  href={`https://wa.me/${(empresa.telefono_empresa || '').replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  📱 WhatsApp
                </a>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
