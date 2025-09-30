import { WebGeneratorService } from '@/lib/services/webgenerator';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { EmpresaLayout } from '@/components/empresa-layout';
import { generateSlug } from '@/lib/utils';
import { processImageUrl } from '@/lib/utils/image-url';
import ProductosGrid from '@/components/ProductosGrid';

interface PageProps {
  params: Promise<{ slug: string; categoria: string; subcategoria: string }>;
}

// Configuración para forzar revalidación en producción
export const revalidate = 0; // Desactiva el cache estático
export const dynamic = 'force-dynamic'; // Fuerza rendering dinámico

export default async function SubcategoriaPage({ params }: PageProps) {
  const { slug, categoria, subcategoria } = await params;
  
  // Log para debugging en producción
  console.log(`[${new Date().toISOString()}] Cargando subcategoría "${subcategoria}" en categoría "${categoria}" para empresa "${slug}"`);
  
  const empresa = await WebGeneratorService.getEmpresaBySlug(slug);
  
  if (!empresa) {
    notFound();
  }

  // Obtener colores desde la tabla de colorimetría o usar fallbacks
  const colorPrimario = empresa.colores?.primario?.color || empresa.color_primario || '#2563eb';
  const colorSecundario = empresa.colores?.secundario?.color || empresa.color_secundario || '#7c3aed';
  const colorTerciario = empresa.colores?.terciario?.color || '#f97316';

  // Buscar la categoría específica
  const categoriaEncontrada = empresa.categorias?.find(
    cat => generateSlug(cat.nombre) === categoria
  );

  if (!categoriaEncontrada) {
    notFound();
  }

  // Buscar la subcategoría específica
  const subcategoriaEncontrada = categoriaEncontrada.subcategorias?.find(
    subcat => generateSlug(subcat.nombre) === subcategoria
  );

  if (!subcategoriaEncontrada) {
    notFound();
  }

  // Filtrar productos de esta subcategoría específica
  const productosDeSubcategoria = empresa.productos?.filter(
    producto => producto.subcategoria_id === subcategoriaEncontrada.id
  ) || [];

  return (
    <EmpresaLayout empresa={empresa} categoriaActiva={categoria}>
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm">
            <Link 
              href={`/${slug}`}
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              Inicio
            </Link>
            <span className="text-gray-400">›</span>
            <Link 
              href={`/${slug}/${categoria}`}
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              {categoriaEncontrada.nombre}
            </Link>
            <span className="text-gray-400">›</span>
            <span className="text-gray-900 font-medium">{subcategoriaEncontrada.nombre}</span>
          </div>
          <Link 
            href={`/${slug}/${categoria}`}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors mt-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Volver a {categoriaEncontrada.nombre}</span>
          </Link>
        </div>
      </div>

      {/* Contenido de la subcategoría */}
      <div className="py-12 min-h-screen bg-gray-50">
        <div className="container mx-auto px-4">
          {/* Header de la subcategoría - Simplificado */}
          <div className="text-center mb-12">
            <div 
              className="inline-block px-8 py-4 rounded-2xl shadow-lg"
              style={{ backgroundColor: colorPrimario }}
            >
              <h1 className="text-3xl font-bold text-white">
                {subcategoriaEncontrada.nombre}
              </h1>
            </div>
          </div>

          {/* Sección de productos de la subcategoría */}
          {productosDeSubcategoria.length > 0 ? (
            <ProductosGrid
              productos={productosDeSubcategoria}
              mostrarCategoria={false}
              className="max-w-6xl mx-auto"
            />
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-10 h-10 bg-gray-400 rounded"></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                Sin productos disponibles
              </h3>
              <p className="text-gray-500">
                Esta subcategoría aún no tiene productos asignados
              </p>
            </div>
          )}
        </div>
      </div>
    </EmpresaLayout>
  );
}

export async function generateStaticParams({ params }: { params: { slug: string; categoria: string } }) {
  const empresa = await WebGeneratorService.getEmpresaBySlug(params.slug);
  
  if (!empresa || !empresa.categorias) {
    return [];
  }

  const categoria = empresa.categorias.find(
    cat => generateSlug(cat.nombre) === params.categoria
  );

  if (!categoria || !categoria.subcategorias) {
    return [];
  }

  return categoria.subcategorias.map((subcategoria) => ({
    subcategoria: generateSlug(subcategoria.nombre),
  }));
}