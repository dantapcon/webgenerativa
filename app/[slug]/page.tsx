import { WebGeneratorService } from '@/lib/services/oftalmologia';
import { notFound } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, Phone, MapPin, Globe, ExternalLink, Play } from 'lucide-react';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function EmpresaPage({ params }: PageProps) {
  const { slug } = await params;
  const empresa = await WebGeneratorService.getEmpresaBySlug(slug);

  if (!empresa) {
    notFound();
  }

  const styles = {
    fontFamily: `'${empresa.tipografia || 'Inter'}', sans-serif`,
    '--color-primario': empresa.color_primario || '#2563eb',
    '--color-secundario': empresa.color_secundario || '#1e40af',
  } as React.CSSProperties;

  return (
    <div className="min-h-screen bg-gray-50" style={styles}>
      {/* Header */}
      <header 
        className="relative overflow-hidden text-white"
        style={{
          background: `linear-gradient(135deg, ${empresa.color_primario} 0%, ${empresa.color_secundario} 100%)`
        }}
      >
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 py-16">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                {empresa.nombre_empresa}
              </h1>
              {empresa.descripcion_empresa && (
                <p className="text-xl md:text-2xl text-white/90 max-w-2xl">
                  {empresa.descripcion_empresa}
                </p>
              )}
              <div className="flex flex-wrap gap-4 mt-6">
                {empresa.correo_empresa && (
                  <a 
                    href={`mailto:${empresa.correo_empresa}`}
                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
                  >
                    <Mail className="h-4 w-4" />
                    Contactar
                  </a>
                )}
                {empresa.telefono_empresa && (
                  <a 
                    href={`tel:${empresa.telefono_empresa}`}
                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
                  >
                    <Phone className="h-4 w-4" />
                    Llamar
                  </a>
                )}
              </div>
            </div>
            {empresa.logo_url && (
              <div className="flex-shrink-0">
                <img 
                  src={empresa.logo_url} 
                  alt={`Logo de ${empresa.nombre_empresa}`}
                  className="h-24 md:h-32 w-auto bg-white/10 p-4 rounded-lg backdrop-blur-sm"
                />
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Video promocional */}
      {empresa.video_promocional_url && (
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Conócenos Mejor
              </h2>
              <div className="flex justify-center">
                <div className="relative max-w-4xl w-full">
                  <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                    <iframe
                      src={empresa.video_promocional_url}
                      className="w-full h-full"
                      allowFullScreen
                      title="Video promocional"
                    ></iframe>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Categorías y Subcategorías */}
      {empresa.categorias && empresa.categorias.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {empresa.tipo_negocio === 'servicios' ? 'Nuestros Servicios' : 'Lo Que Ofrecemos'}
              </h2>
              <p className="text-xl text-gray-600">
                Explora todo lo que tenemos para ti
              </p>
            </div>

            <div className="space-y-12">
              {empresa.categorias.map((categoria, index) => (
                <div key={categoria.id} className="space-y-8">
                  <div className="text-center">
                    <Badge 
                      variant="outline" 
                      className="text-lg px-4 py-2 mb-4"
                      style={{ 
                        borderColor: empresa.color_primario || '#2563eb', 
                        color: empresa.color_primario || '#2563eb' 
                      }}
                    >
                      {categoria.nombre}
                    </Badge>
                    {categoria.descripcion && (
                      <p className="text-gray-600 max-w-2xl mx-auto">
                        {categoria.descripcion}
                      </p>
                    )}
                  </div>

                  {/* Subcategorías */}
                  {categoria.subcategorias && categoria.subcategorias.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {categoria.subcategorias.map((subcategoria: any) => (
                        <Card key={subcategoria.id} className="group hover:shadow-lg transition-shadow">
                          <CardContent className="p-6">
                            {subcategoria.imagen_url && (
                              <div className="mb-4 overflow-hidden rounded-lg">
                                <img 
                                  src={subcategoria.imagen_url} 
                                  alt={subcategoria.nombre_subcategoria}
                                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              </div>
                            )}
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                              {subcategoria.nombre_subcategoria}
                            </h3>
                            {subcategoria.descripcion_subcategoria && (
                              <p className="text-gray-600 mb-4">
                                {subcategoria.descripcion_subcategoria}
                              </p>
                            )}
                            {subcategoria.enlace_externo && (
                              <Button 
                                asChild
                                className="w-full"
                                style={{ backgroundColor: empresa.color_primario || '#2563eb' }}
                              >
                                <a href={subcategoria.enlace_externo} target="_blank" rel="noopener noreferrer">
                                  Ver Más
                                  <ExternalLink className="h-4 w-4 ml-2" />
                                </a>
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Información de contacto */}
      <section 
        className="py-16 text-white"
        style={{
          background: `linear-gradient(135deg, ${empresa.color_secundario} 0%, ${empresa.color_primario} 100%)`
        }}
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              ¡Hablemos!
            </h2>
            <p className="text-xl text-white/90">
              Estamos aquí para ayudarte
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {empresa.correo_empresa && (
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-4">
                  <Mail className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Email</h3>
                <a 
                  href={`mailto:${empresa.correo_empresa}`}
                  className="text-white/90 hover:text-white transition-colors"
                >
                  {empresa.correo_empresa}
                </a>
              </div>
            )}

            {empresa.telefono_empresa && (
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-4">
                  <Phone className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Teléfono</h3>
                <a 
                  href={`tel:${empresa.telefono_empresa}`}
                  className="text-white/90 hover:text-white transition-colors"
                >
                  {empresa.telefono_empresa}
                </a>
              </div>
            )}

            {empresa.direccion_empresa && (
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-4">
                  <MapPin className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Ubicación</h3>
                <p className="text-white/90">
                  {empresa.direccion_empresa}
                </p>
              </div>
            )}
          </div>

          <div className="text-center mt-12">
            <Button 
              asChild
              size="lg"
              className="bg-white text-gray-900 hover:bg-gray-100"
            >
              <a href={`mailto:${empresa.correo_empresa}`}>
                Contáctanos Ahora
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {empresa.logo_url && (
                <img 
                  src={empresa.logo_url} 
                  alt={`Logo de ${empresa.nombre_empresa}`}
                  className="h-8 w-auto"
                />
              )}
              <span className="font-semibold">{empresa.nombre_empresa}</span>
            </div>
            <div className="text-center md:text-right text-gray-400">
              <p>© 2024 {empresa.nombre_empresa}. Todos los derechos reservados.</p>
              <p className="text-sm">
                Sitio web creado con <Link href="/generador" className="text-blue-400 hover:underline">WebGenerator Pro</Link>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Generar metadata dinámica
export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const empresa = await WebGeneratorService.getEmpresaBySlug(slug);

  if (!empresa) {
    return {
      title: 'Página no encontrada',
    };
  }

  return {
    title: empresa.nombre_empresa,
    description: empresa.descripcion_empresa || `Sitio web de ${empresa.nombre_empresa}`,
    keywords: [
      empresa.nombre_empresa,
      empresa.tipo_negocio,
      ...(empresa.categorias?.map(cat => cat.nombre) || [])
    ].filter(Boolean).join(', '),
  };
}
