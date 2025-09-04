import { WebGeneratorService } from '@/lib/services/oftalmologia';
import { notFound } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { EmpresaLayout } from '@/components/empresa-layout';
import { generateSlug } from '@/lib/utils';

interface PageProps {
  params: Promise<{ slug: string; categoria: string }>;
}

export default async function CategoriaPage({ params }: PageProps) {
  const { slug, categoria } = await params;
  
  const empresa = await WebGeneratorService.getEmpresaBySlug(slug);
  
  if (!empresa) {
    notFound();
  }

  // Buscar la categoría específica usando la función generateSlug consistente
  const categoriaEncontrada = empresa.categorias?.find(
    cat => generateSlug(cat.nombre) === categoria
  );

  if (!categoriaEncontrada) {
    notFound();
  }

  return (
    <EmpresaLayout empresa={empresa} categoriaActiva={categoria}>
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <Link 
            href={`/${slug}`}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Volver al inicio</span>
          </Link>
        </div>
      </div>

      {/* Contenido de la categoría */}
      <div className="py-12">
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
                  <CardContent className="p-6">
                    {/* Título siempre visible en la parte superior */}
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      {subcategoria.nombre}
                    </h3>
                    
                    {/* Imagen debajo del título si existe */}
                    {subcategoria.imagen_url && (
                      <div className="relative overflow-hidden h-56 mb-4 rounded-lg">
                        <img 
                          src={subcategoria.imagen_url} 
                          alt={subcategoria.nombre}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
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
      </div>
    </EmpresaLayout>
  );
}

export async function generateStaticParams({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const empresa = await WebGeneratorService.getEmpresaBySlug(slug);
  
  if (!empresa || !empresa.categorias) {
    return [];
  }

  return empresa.categorias.map((categoria) => ({
    categoria: generateSlug(categoria.nombre),
  }));
}
