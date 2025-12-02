'use client';

import React from 'react';
import { CartIcon } from './CartIcon';
import { CartDrawer } from './CartDrawer';
import { useCartActions } from '@/contexts/CartContext';

interface CartWrapperProps {
  empresaId?: number;
  showFloatingIcon?: boolean;
  iconPosition?: 'fixed' | 'relative';
  iconSize?: 'sm' | 'default' | 'lg';
  className?: string;
}

export function CartWrapper({
  empresaId,
  showFloatingIcon = true,
  iconPosition = 'fixed',
  iconSize = 'default',
  className,
}: CartWrapperProps) {
  const { setEmpresa } = useCartActions();

  // Establecer la empresa cuando el componente se monta
  React.useEffect(() => {
    if (empresaId) {
      setEmpresa(empresaId);
    }
  }, [empresaId, setEmpresa]);

  return (
    <>
      {/* Drawer del carrito */}
      <CartDrawer />
      
      {/* Ícono flotante del carrito */}
      {showFloatingIcon && (
        <CartIcon 
          position={iconPosition}
          size={iconSize}
          className={className}
        />
      )}
    </>
  );
}