import { WebGeneratorService } from '@/lib/services/webgenerator';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Phone } from 'lucide-react';
import { EmpresaLayout } from '@/components/empresa-layout';
import RichTextDisplay from '@/components/ui/rich-text-display';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function EmpresaPage({ params }: PageProps) {
  const { slug } = await params;
  
  const empresa = await WebGeneratorService.getEmpresaBySlug(slug);
  
  if (!empresa) {
    notFound();
  }

  // Obtener colores desde la tabla de colorimetría o usar fallbacks
  const colorPrimario = empresa.colores?.primario?.color || empresa.color_primario || '#2563eb';
  const colorSecundario = empresa.colores?.secundario?.color || empresa.color_secundario || '#7c3aed';
  const colorTerciario = empresa.colores?.terciario?.color || '#f97316';

  return (
    <EmpresaLayout empresa={empresa}>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r text-white py-20 overflow-hidden" style={{
        background: `linear-gradient(135deg, ${colorPrimario}, ${colorSecundario})`
      }}>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="text-4xl md:text-6xl font-bold mb-6">
            <RichTextDisplay content={empresa.nombre_empresa} />
          </div>
          <RichTextDisplay 
            content={empresa.descripcion_empresa || `Bienvenido a nuestro sitio web`}
            className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90"
          />
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {empresa.telefono_empresa && (
              <Button
                asChild
                size="lg"
                className="bg-white text-gray-800 hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <a href={`tel:${empresa.telefono_empresa}`} className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  {empresa.telefono_empresa}
                </a>
              </Button>
            )}
            <Button
              asChild
              size="lg"
              className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <a
                href={`https://wa.me/${(empresa.telefono_empresa || '').replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                📱 WhatsApp
              </a>
            </Button>
          </div>
        </div>
        
        {/* Elementos decorativos */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 right-10 w-48 h-48 bg-white/10 rounded-full blur-xl"></div>
      </section>

      {/* Sección de presentación de la empresa */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              {empresa.tipo_negocio === 'servicios' ? 'Nuestros Servicios Profesionales' : 'Lo Que Hacemos'}
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              {empresa.descripcion_empresa || `En ${empresa.nombre_empresa} nos dedicamos a brindar el mejor servicio a nuestros clientes con profesionalismo y calidad.`}
            </p>
          </div>
        </div>
      </section>

      {/* Llamada a la acción */}
      <section className="py-16 bg-gradient-to-r from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            ¿Listo para comenzar?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Contáctanos hoy mismo y descubre cómo podemos ayudarte
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {empresa.telefono_empresa && (
              <Button
                asChild
                size="lg"
                className="text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                style={{ backgroundColor: colorPrimario }}
              >
                <a href={`tel:${empresa.telefono_empresa}`} className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Llamar Ahora
                </a>
              </Button>
            )}
            <Button
              asChild
              size="lg"
              className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <a
                href={`https://wa.me/${(empresa.telefono_empresa || '').replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                📱 WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </section>
    </EmpresaLayout>
  );
}
