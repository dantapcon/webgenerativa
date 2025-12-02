'use client';

import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCartActions } from '@/contexts/CartContext';
import { cn } from '@/lib/utils';

interface CartIconProps {
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  position?: 'fixed' | 'relative';
}

export function CartIcon({ 
  className, 
  size = 'default', 
  position = 'fixed' 
}: CartIconProps) {
  const { state, toggleCart } = useCartActions();

  const sizeClasses = {
    sm: 'h-8 w-8',
    default: 'h-12 w-12',
    lg: 'h-16 w-16',
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    default: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  const positionClasses = position === 'fixed' 
    ? 'fixed bottom-6 right-6 z-50 shadow-lg hover:shadow-xl' 
    : '';

  return (
    <div className={cn(positionClasses, className)}>
      <Button
        onClick={toggleCart}
        className={cn(
          'relative rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200',
          sizeClasses[size]
        )}
        size="icon"
      >
        <ShoppingCart className={iconSizes[size]} />
        
        {/* Contador de items */}
        {state.itemCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs font-bold"
          >
            {state.itemCount > 99 ? '99+' : state.itemCount}
          </Badge>
        )}
      </Button>
      
      {/* Animación de pulso cuando se agrega algo */}
      {state.isOpen && (
        <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
      )}
    </div>
  );
}