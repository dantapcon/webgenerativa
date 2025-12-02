'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CartWrapper, AddToCartButton, useCartActions } from '@/components/cart';
import { Producto } from '@/lib/types/webgenerator';

// Productos de ejemplo para la demo
const productosDemo: Producto[] = [
  {
    id: 1,
    empresa_id: 1,
    nombre: 'Producto Demo 1',
    descripcion: 'Este es un producto de demostración para probar el carrito',
    precio: 25000,
    imagen_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300',
    orden: 1,
    activo: true,
    fecha_creacion: new Date().toISOString(),
    fecha_actualizacion: new Date().toISOString(),
    descuento_prom: 10,
    promocion_activa: true,
    categoria: { 
      id: 1,
      empresa_id: 1,
      nombre: 'Electrónicos',
      orden: 1,
      visible: true,
      fecha_creacion: new Date().toISOString()
    }
  },
  {
    id: 2,
    empresa_id: 1,
    nombre: 'Producto Demo 2',
    descripcion: 'Otro producto increíble para la demostración',
    precio: 45000,
    imagen_url: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=300',
    orden: 2,
    activo: true,
    fecha_creacion: new Date().toISOString(),
    fecha_actualizacion: new Date().toISOString(),
    descuento_prom: 0,
    promocion_activa: false,
    categoria: { 
      id: 2,
      empresa_id: 1,
      nombre: 'Accesorios',
      orden: 2,
      visible: true,
      fecha_creacion: new Date().toISOString()
    }
  },
  {
    id: 3,
    empresa_id: 1,
    nombre: 'Producto Demo 3',
    descripcion: 'Un producto sin precio para consulta',
    precio: null,
    imagen_url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=300',
    orden: 3,
    activo: true,
    fecha_creacion: new Date().toISOString(),
    fecha_actualizacion: new Date().toISOString(),
    descuento_prom: 0,
    promocion_activa: false,
    categoria: { 
      id: 3,
      empresa_id: 1,
      nombre: 'Consulta',
      orden: 3,
      visible: true,
      fecha_creacion: new Date().toISOString()
    }
  },
  {
    id: 4,
    empresa_id: 1,
    nombre: 'Producto Demo 4',
    descripcion: 'Producto con gran descuento',
    precio: 80000,
    imagen_url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300',
    orden: 4,
    activo: true,
    fecha_creacion: new Date().toISOString(),
    fecha_actualizacion: new Date().toISOString(),
    descuento_prom: 25,
    promocion_activa: true,
    categoria: { 
      id: 4,
      empresa_id: 1,
      nombre: 'Ofertas Especiales',
      orden: 4,
      visible: true,
      fecha_creacion: new Date().toISOString()
    }
  }
];

function CartStatsDisplay() {
  const { state } = useCartActions();
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Estado del Carrito</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-primary">{state.itemCount}</div>
            <div className="text-sm text-muted-foreground">Productos</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">{formatPrice(state.total)}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">{state.items.length}</div>
            <div className="text-sm text-muted-foreground">Items únicos</div>
          </div>
          <div>
            <Badge variant={state.isOpen ? 'default' : 'secondary'}>
              {state.isOpen ? 'Abierto' : 'Cerrado'}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CartDemoPage() {
  const { clearCart, toggleCart } = useCartActions();
  
  const formatPrice = (price: number | null) => {
    if (price === null) return 'Consultar precio';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🛒 Demo del Sistema de Carrito
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Esta es una demostración del sistema de carrito de compras. 
            Agrega productos, ve el ícono flotante y prueba todas las funcionalidades.
          </p>
        </div>

        {/* Estado del carrito */}
        <CartStatsDisplay />

        {/* Controles del carrito */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Controles del Carrito</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button onClick={toggleCart} variant="outline">
                Abrir/Cerrar Carrito
              </Button>
              <Button onClick={clearCart} variant="destructive">
                Vaciar Carrito
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Grid de productos demo */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Productos de Demostración
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {productosDemo.map(producto => (
            <Card key={producto.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {/* Imagen */}
              <div className="aspect-square relative overflow-hidden bg-gray-100">
                {producto.imagen_url && (
                  <img
                    src={producto.imagen_url}
                    alt={producto.nombre}
                    className="w-full h-full object-cover"
                  />
                )}
                
                {/* Badges */}
                {producto.promocion_activa && (
                  <div className="absolute top-2 left-2">
                    <Badge className="bg-red-600 text-white">
                      Oferta
                    </Badge>
                  </div>
                )}
                
                {producto.descuento_prom > 0 && (
                  <div className="absolute top-2 right-2">
                    <Badge variant="destructive">
                      -{producto.descuento_prom}%
                    </Badge>
                  </div>
                )}
              </div>

              <CardContent className="p-4">
                {/* Categoría */}
                {producto.categoria && (
                  <Badge variant="secondary" className="text-xs mb-2">
                    {producto.categoria.nombre}
                  </Badge>
                )}

                {/* Nombre */}
                <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                  {producto.nombre}
                </h3>

                {/* Descripción */}
                {producto.descripcion && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {producto.descripcion}
                  </p>
                )}

                {/* Precio */}
                <div className="mb-4">
                  {producto.precio ? (
                    <div className="flex items-center justify-between">
                      <div>
                        {producto.descuento_prom > 0 ? (
                          <>
                            <span className="text-lg font-bold text-green-600">
                              {formatPrice(producto.precio - (producto.precio * producto.descuento_prom / 100))}
                            </span>
                            <span className="text-sm text-gray-400 line-through ml-2">
                              {formatPrice(producto.precio)}
                            </span>
                          </>
                        ) : (
                          <span className="text-lg font-bold text-gray-900">
                            {formatPrice(producto.precio)}
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-2">
                      <span className="text-gray-600 font-medium">Consultar precio</span>
                    </div>
                  )}
                </div>

                {/* Botón de agregar al carrito */}
                <AddToCartButton 
                  product={producto}
                  size="sm"
                  className="w-full"
                />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Información adicional */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>💡 Funcionalidades Implementadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">✅ Funcionalidades Básicas:</h3>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Agregar productos al carrito</li>
                  <li>• Actualizar cantidades</li>
                  <li>• Eliminar productos</li>
                  <li>• Vaciar carrito completo</li>
                  <li>• Persistencia en localStorage</li>
                  <li>• Contador visual en el ícono</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">🎨 Características Visuales:</h3>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Ícono flotante responsivo</li>
                  <li>• Panel lateral (drawer) elegante</li>
                  <li>• Animaciones y transiciones</li>
                  <li>• Feedback visual al agregar</li>
                  <li>• Soporte para descuentos</li>
                  <li>• Cálculo automático de totales</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Carrito flotante */}
      <CartWrapper empresaId={1} />
    </div>
  );
}