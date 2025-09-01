import { WebGeneratorService } from '@/lib/services/oftalmologia';
import { notFound } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { CategoryNavigation } from '@/components/category-navigation';

interface PageProps {
  params: Promise<{ slug: string; categoria: string }>;
}

export default async function CategoriaPage({ params }: PageProps) {
  const { slug, categoria } = await params;
  
  const empresa = await WebGeneratorService.getEmpresaBySlug(slug);
  
  if (!empresa) {
    notFound();
  }

  // Buscar la categoría específica
  const categoriaEncontrada = empresa.categorias?.find(
    cat => cat.nombre.toLowerCase().replace(/\s+/g, '-') === categoria
  );

  if (!categoriaEncontrada) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header con logo y navegación */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href={`/${slug}`}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Volver</span>
              </Link>
              <div className="h-8 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-2xl font-bold" style={{ 
                  color: empresa.color_primario || '#2563eb',
                  fontFamily: `'${empresa.tipografia}', sans-serif`
                }}>
                  {empresa.nombre_empresa}
                </h1>
                <p className="text-sm text-gray-600">{empresa.direccion_empresa}</p>
              </div>
            </div>

            {/* Información de contacto */}
            <div className="hidden md:flex items-center gap-6">
              {empresa.telefono_empresa && (
                <div className="text-right">
                  <p className="text-sm text-gray-500">Teléfono</p>
                  <p className="font-semibold" style={{ color: empresa.color_primario || '#2563eb' }}>
                    {empresa.telefono_empresa}
                  </p>
                </div>
              )}
              <Button
                asChild
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                <a 
                  href={`https://wa.me/${(empresa.telefono_empresa || '').replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp
                </a>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navegación de categorías */}
      {empresa.categorias && empresa.categorias.length > 0 && (
        <CategoryNavigation
          categorias={empresa.categorias}
          empresaSlug={slug}
          categoriaActual={categoriaEncontrada.id}
          colorPrimario={empresa.color_primario}
          tipografia={empresa.tipografia}
        />
      )}

      {/* Contenido de la categoría */}
      <main className="py-12">
        <div className="container mx-auto px-4">
          {/* Header de la categoría */}
          <div className="text-center mb-12">
            <div className="inline-block mb-6">
              <div 
                className="px-8 py-4 rounded-2xl text-2xl font-bold text-white shadow-lg"
                style={{ backgroundColor: empresa.color_primario || '#2563eb' }}
              >
                {categoriaEncontrada.nombre}
              </div>
            </div>
            {categoriaEncontrada.descripcion && (
              <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                {categoriaEncontrada.descripcion}
              </p>
            )}
          </div>

          {/* Subcategorías */}
          {categoriaEncontrada.subcategorias && categoriaEncontrada.subcategorias.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {categoriaEncontrada.subcategorias.map((subcategoria: any) => (
                <Card key={subcategoria.id} className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden">
                  {subcategoria.imagen_url && (
                    <div className="relative overflow-hidden h-56">
                      <img 
                        src={subcategoria.imagen_url} 
                        alt={subcategoria.nombre}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-xl font-bold text-white drop-shadow-lg">
                          {subcategoria.nombre}
                        </h3>
                      </div>
                    </div>
                  )}
                  
                  <CardContent className="p-6">
                    {!subcategoria.imagen_url && (
                      <h3 className="text-xl font-bold text-gray-900 mb-3">
                        {subcategoria.nombre}
                      </h3>
                    )}
                    
                    {subcategoria.descripcion && (
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        {subcategoria.descripcion}
                      </p>
                    )}
                    
                    {subcategoria.enlace_externo && (
                      <Button
                        asChild
                        className="w-full group/btn text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                        style={{ backgroundColor: empresa.color_primario || '#2563eb' }}
                      >
                        <a
                          href={subcategoria.enlace_externo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2"
                        >
                          Consultar más
                          <ExternalLink className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                        </a>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <ExternalLink className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                Próximamente
              </h3>
              <p className="text-gray-500">
                Estamos trabajando en el contenido de esta categoría
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Footer de contacto */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4" style={{ 
              fontFamily: `'${empresa.tipografia}', sans-serif`
            }}>
              {empresa.nombre_empresa}
            </h3>
            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              {empresa.direccion_empresa && (
                <p className="text-gray-300">📍 {empresa.direccion_empresa}</p>
              )}
              {empresa.telefono_empresa && (
                <p className="text-gray-300">📞 {empresa.telefono_empresa}</p>
              )}
              {empresa.correo_empresa && (
                <p className="text-gray-300">✉️ {empresa.correo_empresa}</p>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export async function generateStaticParams({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const empresa = await WebGeneratorService.getEmpresaBySlug(slug);
  
  if (!empresa || !empresa.categorias) {
    return [];
  }

  return empresa.categorias.map((categoria) => ({
    categoria: categoria.nombre.toLowerCase().replace(/\s+/g, '-'),
  }));
}
