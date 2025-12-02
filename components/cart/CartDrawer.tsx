'use client';

import React from 'react';
import { ShoppingCart, Plus, Minus, Trash2, X } from 'lucide-react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription,
  SheetTrigger 
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCartActions } from '@/contexts/CartContext';
import Image from 'next/image';

export function CartDrawer() {
  const { state, updateQuantity, removeItem, clearCart, closeCart } = useCartActions();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const calculateItemTotal = (item: any) => {
    const subtotal = item.price * item.quantity;
    const discount = item.descuento ? (subtotal * item.descuento) / 100 : 0;
    return subtotal - discount;
  };

  return (
    <Sheet open={state.isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Tu Carrito
            </SheetTitle>
            <Badge variant="secondary" className="ml-2">
              {state.itemCount} {state.itemCount === 1 ? 'producto' : 'productos'}
            </Badge>
          </div>
          <SheetDescription>
            {state.items.length === 0 
              ? 'Tu carrito está vacío' 
              : `Total: ${formatPrice(state.total)}`
            }
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4 py-6">
          {state.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground">
                Tu carrito está vacío
              </h3>
              <p className="text-sm text-muted-foreground mt-2">
                Agrega algunos productos para comenzar
              </p>
            </div>
          ) : (
            <>
              {/* Lista de productos */}
              <div className="flex-1 space-y-4 max-h-96 overflow-y-auto">
                {state.items.map((item) => (
                  <div key={item.productId} className="flex gap-3 p-3 border rounded-lg">
                    {/* Imagen del producto */}
                    <div className="flex-shrink-0">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={60}
                          height={60}
                          className="rounded-md object-cover"
                        />
                      ) : (
                        <div className="w-15 h-15 bg-muted rounded-md flex items-center justify-center">
                          <ShoppingCart className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Información del producto */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{item.name}</h4>
                      {item.categoria && (
                        <p className="text-xs text-muted-foreground">{item.categoria}</p>
                      )}
                      
                      <div className="flex items-center gap-2 mt-2">
                        <span className="font-semibold text-sm">
                          {formatPrice(item.price)}
                        </span>
                        {item.descuento && item.descuento > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            -{item.descuento}%
                          </Badge>
                        )}
                      </div>
                      
                      <div className="text-xs text-muted-foreground mt-1">
                        Subtotal: {formatPrice(calculateItemTotal(item))}
                      </div>
                    </div>

                    {/* Controles de cantidad */}
                    <div className="flex flex-col items-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => removeItem(item.productId)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                      
                      <div className="flex items-center gap-1 border rounded">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        
                        <span className="text-sm font-medium px-2 min-w-[2rem] text-center">
                          {item.quantity}
                        </span>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Resumen del carrito */}
              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between items-center font-semibold text-lg">
                  <span>Total:</span>
                  <span>{formatPrice(state.total)}</span>
                </div>

                {/* Botones de acción */}
                <div className="space-y-2">
                  <Button className="w-full" size="lg">
                    Proceder al Checkout
                  </Button>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={closeCart}
                    >
                      Seguir Comprando
                    </Button>
                    
                    <Button
                      variant="ghost"
                      className="flex-1"
                      onClick={clearCart}
                    >
                      Vaciar Carrito
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}