import { WebGeneratorService } from '@/lib/services/webgenerator';
import { notFound } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { EmpresaLayout } from '@/components/empresa-layout';
import { generateSlug } from '@/lib/utils';
import UbicacionesPage from '@/components/ubicaciones-page';
import { processImageUrl } from '@/lib/utils/image-url';
import ProductosGrid from '@/components/ProductosGrid';

interface PageProps {
  params: Promise<{ slug: string; categoria: string }>;
}

// Configuración para forzar revalidación en producción
export const revalidate = 0; // Desactiva el cache estático
export const dynamic = 'force-dynamic'; // Fuerza rendering dinámico

export default async function CategoriaPage({ params }: PageProps) {
  const { slug, categoria } = await params;
  
  // Log para debugging en producción
  console.log(`[${new Date().toISOString()}] Cargando categoría "${categoria}" para empresa "${slug}"`);
  
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

  // Verificar si es la categoría especial de ubicaciones
  const esUbicaciones = categoriaEncontrada.nombre.toLowerCase() === 'ubicaciones';

  // Filtrar productos de esta categoría específica que NO tienen subcategoría
  // (productos que pertenecen directamente a la categoría, no a subcategorías)
  const productosDeCategoria = empresa.productos?.filter(
    producto => producto.categoria_id === categoriaEncontrada.id && !producto.subcategoria_id
  ) || [];

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

      {/* Contenido de la categoría con fondo personalizado */}
      <div 
        className="py-12 min-h-screen"
        style={{
          backgroundColor: categoriaEncontrada.fondo_tipo === 'color' 
            ? (categoriaEncontrada.fondo_color || '#ffffff')
            : 'transparent',
          backgroundImage: categoriaEncontrada.fondo_tipo === 'imagen' && categoriaEncontrada.fondo_imagen
            ? `url(${processImageUrl(categoriaEncontrada.fondo_imagen)})`
            : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed'
        }}
      >
        {/* Overlay para mejorar la legibilidad cuando hay imagen de fondo */}
        {categoriaEncontrada.fondo_tipo === 'imagen' && categoriaEncontrada.fondo_imagen && (
          <div className="absolute inset-0 bg-black/20 pointer-events-none" />
        )}
        
        <div className="container mx-auto px-4 relative z-10">
          {esUbicaciones ? (
            // Mostrar página especial de ubicaciones
            <UbicacionesPage 
              empresaId={empresa.id} 
              colorPrimario={empresa.color_primario || '#2563eb'} 
              empresaNombre={empresa.nombre_empresa}
            />
          ) : (
            // Mostrar contenido normal de categorías
            <>
              {/* Header de la categoría */}
              <div className="text-center mb-12">
                <div className="inline-block mb-6">
                  <div 
                    className="px-8 py-4 rounded-2xl text-2xl font-bold text-white shadow-lg backdrop-blur-sm"
                    style={{ 
                      backgroundColor: categoriaEncontrada.fondo_tipo === 'imagen' && categoriaEncontrada.fondo_imagen
                        ? 'rgba(0, 0, 0, 0.7)'
                        : (empresa.color_primario || '#2563eb')
                    }}
                  >
                    {categoriaEncontrada.nombre}
                  </div>
                </div>
                {categoriaEncontrada.descripcion && (
                  <div 
                    className="inline-block px-6 py-3 rounded-lg backdrop-blur-sm"
                    style={{
                      backgroundColor: categoriaEncontrada.fondo_tipo === 'imagen' && categoriaEncontrada.fondo_imagen
                        ? 'rgba(255, 255, 255, 0.9)'
                        : 'transparent'
                    }}
                  >
                    <p className={`text-xl max-w-4xl mx-auto leading-relaxed ${
                      categoriaEncontrada.fondo_tipo === 'imagen' && categoriaEncontrada.fondo_imagen
                        ? 'text-gray-800'
                        : 'text-gray-600'
                    }`}>
                      {categoriaEncontrada.descripcion}
                    </p>
                  </div>
                )}
              </div>

              {/* Subcategorías */}
              {categoriaEncontrada.subcategorias && categoriaEncontrada.subcategorias.length > 0 ? (
            <div className={`grid grid-cols-1 gap-8 ${
              categoriaEncontrada.tipo_display === 'vertical' 
                ? 'max-w-3xl mx-auto' 
                : 'md:grid-cols-2 lg:grid-cols-3'
            }`}>
              {categoriaEncontrada.subcategorias.map((subcategoria: any) => (
                <Card key={subcategoria.id} className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden">
                  <CardContent className="p-6">
                    {/* Layout vertical */}
                    {categoriaEncontrada.tipo_display === 'vertical' ? (
                      <div className="md:flex md:gap-6">
                        {/* Imagen a la izquierda en modo vertical */}
                        {subcategoria.imagen_url && (
                          <div className="relative overflow-hidden rounded-lg md:w-48 md:h-48 md:flex-shrink-0 mb-4 md:mb-0">
                            <img 
                              src={processImageUrl(subcategoria.imagen_url)} 
                              alt={subcategoria.nombre}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          </div>
                        )}
                        
                        {/* Contenido a la derecha en modo vertical */}
                        <div className="md:flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-4">
                            {subcategoria.nombre}
                          </h3>
                          
                          {subcategoria.descripcion && (
                            <p className="text-gray-600 mb-6 leading-relaxed">
                              {subcategoria.descripcion}
                            </p>
                          )}
                          
                          {/* Botón para navegar a la subcategoría */}
                          <Button
                            asChild
                            className="w-full group/btn text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                            style={{ backgroundColor: empresa.color_primario || '#2563eb' }}
                          >
                            <Link
                              href={`/${slug}/${categoria}/${generateSlug(subcategoria.nombre)}`}
                              className="flex items-center justify-center gap-2"
                            >
                              Ver productos
                              <ExternalLink className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                            </Link>
                          </Button>
                          
                          {/* Enlace externo adicional si existe */}
                          {subcategoria.enlace_externo && (
                            <Button
                              asChild
                              variant="outline"
                              className="w-full mt-2 group/btn font-semibold py-3 rounded-lg border-2 hover:shadow-lg transition-all duration-300"
                              style={{ 
                                borderColor: empresa.color_primario || '#2563eb',
                                color: empresa.color_primario || '#2563eb'
                              }}
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
                        </div>
                      </div>
                    ) : (
                      /* Layout horizontal (predeterminado) */
                      <>
                        {/* Título arriba en modo horizontal */}
                        <h3 className="text-xl font-bold text-gray-900 mb-4">
                          {subcategoria.nombre}
                        </h3>
                        
                        {/* Imagen debajo del título */}
                        {subcategoria.imagen_url && (
                          <div className="relative overflow-hidden h-56 mb-4 rounded-lg">
                            <img 
                              src={processImageUrl(subcategoria.imagen_url)} 
                              alt={subcategoria.nombre}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          </div>
                        )}
                        
                        {/* Descripción */}
                        {subcategoria.descripcion && (
                          <p className="text-gray-600 mb-6 leading-relaxed">
                            {subcategoria.descripcion}
                          </p>
                        )}
                        
                        {/* Botón para navegar a la subcategoría */}
                        <Button
                          asChild
                          className="w-full group/btn text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                          style={{ backgroundColor: empresa.color_primario || '#2563eb' }}
                        >
                          <Link
                            href={`/${slug}/${categoria}/${generateSlug(subcategoria.nombre)}`}
                            className="flex items-center justify-center gap-2"
                          >
                            Ver productos
                            <ExternalLink className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                          </Link>
                        </Button>
                        
                        {/* Enlace externo adicional si existe */}
                        {subcategoria.enlace_externo && (
                          <Button
                            asChild
                            variant="outline"
                            className="w-full mt-2 group/btn font-semibold py-3 rounded-lg border-2 hover:shadow-lg transition-all duration-300"
                            style={{ 
                              borderColor: empresa.color_primario || '#2563eb',
                              color: empresa.color_primario || '#2563eb'
                            }}
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
                      </>
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

          {/* Sección de productos de la categoría */}
          {productosDeCategoria.length > 0 && (
            <div className="mt-16">
              <div className="text-center mb-12">
                <div 
                  className="inline-block px-6 py-3 rounded-lg backdrop-blur-sm mb-4"
                  style={{
                    backgroundColor: categoriaEncontrada.fondo_tipo === 'imagen' && categoriaEncontrada.fondo_imagen
                      ? 'rgba(0, 0, 0, 0.7)'
                      : (empresa.color_primario || '#2563eb')
                  }}
                >
                  <h2 className="text-2xl font-bold text-white">
                    Productos Disponibles
                  </h2>
                </div>
              </div>
              
              <ProductosGrid
                productos={productosDeCategoria}
                mostrarCategoria={false}
                className="max-w-6xl mx-auto"
              />
            </div>
          )}
            </>
          )}
        </div>
      </div>
    </EmpresaLayout>
  );
}

export async function generateStaticParams(props: { params: { slug: string } }) {
  const empresa = await WebGeneratorService.getEmpresaBySlug(props.params.slug);
  
  if (!empresa || !empresa.categorias) {
    return [];
  }

  return empresa.categorias.map((categoria) => ({
    categoria: generateSlug(categoria.nombre),
  }));
}
