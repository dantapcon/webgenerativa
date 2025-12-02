'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import RichTextDisplay from '@/components/ui/rich-text-display';
import { AddToCartButton } from '@/components/cart';
import { 
  Package, 
  Tag,
  DollarSign,
  Star,
  ShoppingCart,
  Eye
} from 'lucide-react';

import { Producto } from '@/lib/types/webgenerator';

interface ProductosGridProps {
  productos: Producto[];
  mostrarCategoria?: boolean;
  onProductoClick?: (producto: Producto) => void;
  className?: string;
}

export default function ProductosGrid({ 
  productos, 
  mostrarCategoria = true,
  onProductoClick,
  className = ""
}: ProductosGridProps) {
  const formatPrice = (price: number | null): string => {
    if (price === null) return 'Consultar precio';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const getPrecioConDescuento = (precio: number, descuento: number): number => {
    return precio - (precio * descuento / 100);
  };

  if (productos.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No hay productos disponibles
        </h3>
        <p className="text-gray-600">
          Aún no se han agregado productos en esta sección.
        </p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
      {productos.map(producto => (
        <Card 
          key={producto.id} 
          className="overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
          onClick={() => onProductoClick && onProductoClick(producto)}
        >
          {/* Imagen del producto */}
          <div className="aspect-square relative overflow-hidden bg-gray-100">
            {producto.imagen_url ? (
              <img
                src={producto.imagen_url}
                alt={producto.nombre}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder-product.png';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                <Package className="h-16 w-16 text-gray-400" />
              </div>
            )}
            
            {/* Badge de promoción */}
            {producto.promocion_activa && (
              <div className="absolute top-2 left-2">
                <Badge className="bg-red-600 hover:bg-red-700 text-white">
                  <Star className="h-3 w-3 mr-1" />
                  Oferta
                </Badge>
              </div>
            )}

            {/* Badge de descuento */}
            {producto.descuento_prom > 0 && (
              <div className="absolute top-2 right-2">
                <Badge variant="destructive" className="text-white">
                  -{producto.descuento_prom}%
                </Badge>
              </div>
            )}
          </div>

          <CardContent className="p-4">
            {/* Categoría */}
            {mostrarCategoria && producto.categoria && (
              <div className="mb-2">
                <Badge variant="secondary" className="text-xs">
                  <Tag className="h-3 w-3 mr-1" />
                  {producto.categoria.nombre}
                  {producto.subcategoria && ` / ${producto.subcategoria.nombre}`}
                </Badge>
              </div>
            )}

            {/* Nombre del producto */}
            <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2 min-h-[3.5rem]">
              {producto.nombre}
            </h3>

            {/* Descripción */}
            {producto.descripcion && (
              <div className="text-gray-600 text-sm mb-3 line-clamp-2 min-h-[2.5rem]">
                <RichTextDisplay content={producto.descripcion} />
              </div>
            )}

            {/* Precio */}
            <div className="space-y-2">
              {producto.precio ? (
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    {producto.descuento_prom > 0 ? (
                      <>
                        <span className="text-lg font-bold text-green-600">
                          {formatPrice(getPrecioConDescuento(producto.precio, producto.descuento_prom))}
                        </span>
                        <span className="text-sm text-gray-400 line-through">
                          {formatPrice(producto.precio)}
                        </span>
                      </>
                    ) : (
                      <span className="text-lg font-bold text-gray-900">
                        {formatPrice(producto.precio)}
                      </span>
                    )}
                  </div>
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
              ) : (
                <div className="text-center py-2">
                  <span className="text-gray-600 font-medium">Consultar precio</span>
                </div>
              )}
            </div>

            {/* Botones de acción */}
            <div className="space-y-2 mt-4">
              {/* Botón de agregar al carrito */}
              <AddToCartButton 
                product={producto}
                size="sm"
                className="w-full"
              />
              
              {/* Botón de ver detalles */}
              {onProductoClick && (
                <Button 
                  className="w-full" 
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onProductoClick(producto);
                  }}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Ver detalles
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Componente para mostrar productos por categorías
interface ProductosPorCategoriaProps {
  productosPorCategoria: Array<{
    categoria: {
      id: number;
      nombre: string;
      descripcion?: string;
    };
    productos: Producto[];
  }>;
  onProductoClick?: (producto: Producto) => void;
  className?: string;
}

export function ProductosPorCategoria({ 
  productosPorCategoria, 
  onProductoClick,
  className = ""
}: ProductosPorCategoriaProps) {
  if (productosPorCategoria.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No hay productos disponibles
        </h3>
        <p className="text-gray-600">
          Aún no se han agregado productos en ninguna categoría.
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-12 ${className}`}>
      {productosPorCategoria.map(({ categoria, productos }) => (
        <section key={categoria.id}>
          {/* Header de categoría */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Tag className="h-6 w-6 text-blue-600" />
              {categoria.nombre}
            </h2>
            {categoria.descripcion && (
              <div className="text-gray-600 mt-2">
                <RichTextDisplay content={categoria.descripcion} />
              </div>
            )}
            <div className="border-b border-gray-200 mt-4"></div>
          </div>

          {/* Grid de productos */}
          <ProductosGrid
            productos={productos}
            mostrarCategoria={false}
            onProductoClick={onProductoClick}
          />
        </section>
      ))}
    </div>
  );
}

// Componente compacto para listas de productos
interface ProductosListaProps {
  productos: Producto[];
  onProductoClick?: (producto: Producto) => void;
  className?: string;
}

export function ProductosLista({ 
  productos, 
  onProductoClick,
  className = ""
}: ProductosListaProps) {
  const formatPrice = (price: number | null): string => {
    if (price === null) return 'Consultar precio';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const getPrecioConDescuento = (precio: number, descuento: number): number => {
    return precio - (precio * descuento / 100);
  };

  if (productos.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p className="text-gray-600">No hay productos disponibles.</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {productos.map(producto => (
        <div 
          key={producto.id}
          className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          onClick={() => onProductoClick && onProductoClick(producto)}
        >
          {/* Imagen */}
          <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
            {producto.imagen_url ? (
              <img
                src={producto.imagen_url}
                alt={producto.nombre}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder-product.png';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="h-6 w-6 text-gray-400" />
              </div>
            )}
          </div>

          {/* Contenido */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 truncate">
                  {producto.nombre}
                </h3>
                {producto.descripcion && (
                  <div className="text-sm text-gray-600 mt-1 line-clamp-2">
                    <RichTextDisplay content={producto.descripcion} />
                  </div>
                )}
                <div className="flex items-center gap-2 mt-2">
                  {producto.categoria && (
                    <Badge variant="secondary" className="text-xs">
                      {producto.categoria.nombre}
                    </Badge>
                  )}
                  {producto.promocion_activa && (
                    <Badge className="bg-red-600 text-white text-xs">
                      <Star className="h-3 w-3 mr-1" />
                      Oferta
                    </Badge>
                  )}
                </div>
              </div>
              
              {/* Precio */}
              <div className="text-right ml-4 flex-shrink-0">
                {producto.precio ? (
                  <div>
                    {producto.descuento_prom > 0 ? (
                      <>
                        <p className="font-bold text-green-600">
                          {formatPrice(getPrecioConDescuento(producto.precio, producto.descuento_prom))}
                        </p>
                        <p className="text-sm text-gray-400 line-through">
                          {formatPrice(producto.precio)}
                        </p>
                      </>
                    ) : (
                      <p className="font-bold text-gray-900">
                        {formatPrice(producto.precio)}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-600 font-medium">Consultar precio</p>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}