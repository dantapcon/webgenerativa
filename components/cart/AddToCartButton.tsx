'use client';

import React, { useState } from 'react';
import { ShoppingCart, Plus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCartActions } from '@/contexts/CartContext';
import { cn } from '@/lib/utils';

interface AddToCartButtonProps {
  product: {
    id: number;
    nombre: string;
    precio?: number | null | undefined;
    imagen_url?: string | null;
    empresa_id: number;
    categoria?: {
      nombre: string;
    } | null;
    descuento_prom?: number | null;
    promocion_activa?: boolean | null;
  };
  className?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showIcon?: boolean;
  showText?: boolean;
}

export function AddToCartButton({
  product,
  className,
  variant = 'default',
  size = 'default',
  showIcon = true,
  showText = true,
}: AddToCartButtonProps) {
  const { addItem, state } = useCartActions();
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  // Verificar si el producto ya está en el carrito
  const existingItem = state.items.find(item => item.productId === product.id);
  const isInCart = !!existingItem;

  const handleAddToCart = async () => {
    setIsAdding(true);
    
    try {
      // Agregar el producto al carrito
      addItem({
        id: Date.now(), // ID temporal para el item del carrito
        productId: product.id,
        name: product.nombre,
        price: product.precio || 0,
        image: product.imagen_url || undefined,
        empresaId: product.empresa_id,
        categoria: product.categoria?.nombre,
        descuento: product.promocion_activa ? (product.descuento_prom || 0) : 0,
      });

      // Mostrar feedback visual
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
      
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Si no hay precio, no mostrar el botón
  if (!product.precio || product.precio <= 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {/* Mostrar precio y descuento */}
      <div className="flex items-center gap-2">
        <span className="font-semibold text-lg">
          {formatPrice(product.precio)}
        </span>
        {product.promocion_activa && product.descuento_prom && product.descuento_prom > 0 && (
          <Badge variant="destructive" className="text-xs">
            -{product.descuento_prom}% OFF
          </Badge>
        )}
      </div>

      {/* Botón de agregar al carrito */}
      <Button
        onClick={handleAddToCart}
        disabled={isAdding}
        variant={justAdded ? 'secondary' : variant}
        size={size}
        className={cn(
          'transition-all duration-200',
          justAdded && 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200',
          className
        )}
      >
        {isAdding ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
        ) : justAdded ? (
          <>
            {showIcon && <Check className="h-4 w-4" />}
            {showText && 'Agregado!'}
          </>
        ) : (
          <>
            {showIcon && <ShoppingCart className="h-4 w-4" />}
            {showText && (isInCart ? `Agregar más (${existingItem?.quantity})` : 'Agregar al carrito')}
          </>
        )}
      </Button>

      {/* Indicador si ya está en el carrito */}
      {isInCart && !justAdded && (
        <p className="text-xs text-muted-foreground">
          Ya tienes {existingItem?.quantity} en tu carrito
        </p>
      )}
    </div>
  );
}