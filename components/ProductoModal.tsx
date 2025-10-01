import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import RichTextDisplay from '@/components/ui/rich-text-display';
import { 
  X, 
  Package, 
  DollarSign, 
  Star, 
  Tag,
  ShoppingCart,
  Share2,
  Eye
} from 'lucide-react';

import { Producto } from '@/lib/types/webgenerator';

interface ProductoModalProps {
  producto: Producto;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart?: (producto: Producto) => void;
  className?: string;
}

export default function ProductoModal({ 
  producto, 
  isOpen, 
  onClose, 
  onAddToCart,
  className = ""
}: ProductoModalProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  if (!isOpen) return null;

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

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: producto.nombre,
          text: producto.descripcion || `Conoce más sobre ${producto.nombre}`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copiar al portapapeles
      navigator.clipboard.writeText(window.location.href);
      // Aquí podrías mostrar un toast de "Enlace copiado"
    }
  };

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${className}`}>
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="h-5 w-5" />
            Detalles del Producto
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Imagen del producto */}
            <div className="space-y-4">
              <div className="aspect-square relative overflow-hidden rounded-lg bg-gray-100">
                {producto.imagen_url && !imageError ? (
                  <>
                    {imageLoading && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                      </div>
                    )}
                    <img
                      src={producto.imagen_url}
                      alt={producto.nombre}
                      className={`w-full h-full object-cover transition-opacity ${
                        imageLoading ? 'opacity-0' : 'opacity-100'
                      }`}
                      onLoad={() => setImageLoading(false)}
                      onError={() => {
                        setImageError(true);
                        setImageLoading(false);
                      }}
                    />
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-24 w-24 text-gray-400" />
                  </div>
                )}

                {/* Badges superpuestos */}
                {producto.promocion_activa && (
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-red-600 hover:bg-red-700 text-white">
                      <Star className="h-3 w-3 mr-1" />
                      En Promoción
                    </Badge>
                  </div>
                )}

                {producto.descuento_prom > 0 && (
                  <div className="absolute top-4 right-4">
                    <Badge variant="destructive" className="text-white text-lg">
                      -{producto.descuento_prom}%
                    </Badge>
                  </div>
                )}
              </div>

              {/* Botones de acción de imagen */}
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleShare}
                  className="flex-1"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartir
                </Button>
                {producto.imagen_url && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => producto.imagen_url && window.open(producto.imagen_url, '_blank')}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Ver imagen
                  </Button>
                )}
              </div>
            </div>

            {/* Información del producto */}
            <div className="space-y-6">
              {/* Categoría y subcategoría */}
              <div className="flex flex-wrap gap-2">
                {producto.categoria && (
                  <Badge variant="secondary" className="text-sm">
                    <Tag className="h-3 w-3 mr-1" />
                    {producto.categoria.nombre}
                  </Badge>
                )}
                {producto.subcategoria && (
                  <Badge variant="outline" className="text-sm">
                    {producto.subcategoria.nombre}
                  </Badge>
                )}
              </div>

              {/* Nombre del producto */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {producto.nombre}
                </h1>
              </div>

              {/* Precio */}
              <div className="space-y-2">
                {producto.precio ? (
                  <div className="flex items-center gap-4">
                    <DollarSign className="h-6 w-6 text-green-600" />
                    <div className="flex flex-col">
                      {producto.descuento_prom > 0 ? (
                        <>
                          <span className="text-3xl font-bold text-green-600">
                            {formatPrice(getPrecioConDescuento(producto.precio, producto.descuento_prom))}
                          </span>
                          <span className="text-lg text-gray-400 line-through">
                            {formatPrice(producto.precio)}
                          </span>
                          <span className="text-sm text-red-600 font-medium">
                            Ahorras {formatPrice(producto.precio - getPrecioConDescuento(producto.precio, producto.descuento_prom))}
                          </span>
                        </>
                      ) : (
                        <span className="text-3xl font-bold text-gray-900">
                          {formatPrice(producto.precio)}
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 border rounded-lg bg-gray-50">
                    <span className="text-xl font-semibold text-gray-700">
                      Precio bajo consulta
                    </span>
                    <p className="text-sm text-gray-600 mt-1">
                      Contacta con la empresa para obtener información sobre precios
                    </p>
                  </div>
                )}
              </div>

              {/* Descripción */}
              {producto.descripcion && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Descripción
                  </h3>
                  <div className="prose prose-sm text-gray-700 max-w-none">
                    <RichTextDisplay content={producto.descripcion} />
                  </div>
                </div>
              )}

              {/* Estado y metadata */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Información adicional
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Estado:</span>
                    <Badge 
                      variant={producto.activo ? "default" : "secondary"}
                      className={`ml-2 ${producto.activo ? "bg-green-100 text-green-800" : ""}`}
                    >
                      {producto.activo ? 'Disponible' : 'No disponible'}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-gray-600">Código:</span>
                    <span className="ml-2 font-mono text-gray-800">
                      #{producto.id.toString().padStart(6, '0')}
                    </span>
                  </div>
                  {producto.fecha_creacion && (
                    <div className="col-span-2">
                      <span className="text-gray-600">Agregado:</span>
                      <span className="ml-2">
                        {new Date(producto.fecha_creacion).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Botón de acción */}
              {producto.activo && (
                <div className="border-t pt-6">
                  {onAddToCart ? (
                    <Button
                      onClick={() => onAddToCart(producto)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                      size="lg"
                    >
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      Agregar al carrito
                    </Button>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-600 mb-2">
                        ¿Te interesa este producto?
                      </p>
                      <p className="text-sm text-gray-500">
                        Contacta directamente con la empresa para realizar tu consulta o pedido
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}