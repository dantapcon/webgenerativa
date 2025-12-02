'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Tipos para el carrito
interface CartItem {
  id: number;
  productId: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  empresaId: number;
  categoria?: string;
  descuento?: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  empresaId: number | null;
  total: number;
  itemCount: number;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'quantity'> & { quantity?: number } }
  | { type: 'REMOVE_ITEM'; payload: { productId: number } }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: number; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_CART' }
  | { type: 'OPEN_CART' }
  | { type: 'CLOSE_CART' }
  | { type: 'LOAD_CART'; payload: CartState }
  | { type: 'SET_EMPRESA'; payload: { empresaId: number } };

const initialState: CartState = {
  items: [],
  isOpen: false,
  empresaId: null,
  total: 0,
  itemCount: 0,
};

// Reducer para manejar las acciones del carrito
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { quantity = 1, ...item } = action.payload;
      
      // Si es de una empresa diferente, limpiar carrito
      if (state.empresaId && state.empresaId !== item.empresaId) {
        const newState = {
          items: [{ ...item, quantity }],
          isOpen: true,
          empresaId: item.empresaId,
          total: item.price * quantity,
          itemCount: quantity,
        };
        return newState;
      }

      // Verificar si el item ya existe
      const existingItemIndex = state.items.findIndex(i => i.productId === item.productId);
      
      if (existingItemIndex >= 0) {
        // Actualizar cantidad del item existente
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex].quantity += quantity;
        
        const newState = {
          ...state,
          items: updatedItems,
          isOpen: true,
          empresaId: item.empresaId,
        };
        
        return calculateTotals(newState);
      } else {
        // Agregar nuevo item
        const newState = {
          ...state,
          items: [...state.items, { ...item, quantity }],
          isOpen: true,
          empresaId: item.empresaId,
        };
        
        return calculateTotals(newState);
      }
    }

    case 'REMOVE_ITEM': {
      const newState = {
        ...state,
        items: state.items.filter(item => item.productId !== action.payload.productId),
      };
      return calculateTotals(newState);
    }

    case 'UPDATE_QUANTITY': {
      const { productId, quantity } = action.payload;
      
      if (quantity <= 0) {
        return cartReducer(state, { type: 'REMOVE_ITEM', payload: { productId } });
      }
      
      const newState = {
        ...state,
        items: state.items.map(item =>
          item.productId === productId ? { ...item, quantity } : item
        ),
      };
      
      return calculateTotals(newState);
    }

    case 'CLEAR_CART':
      return {
        ...initialState,
        isOpen: state.isOpen,
      };

    case 'TOGGLE_CART':
      return { ...state, isOpen: !state.isOpen };

    case 'OPEN_CART':
      return { ...state, isOpen: true };

    case 'CLOSE_CART':
      return { ...state, isOpen: false };

    case 'LOAD_CART':
      return action.payload;

    case 'SET_EMPRESA':
      if (state.empresaId !== action.payload.empresaId) {
        return {
          ...initialState,
          empresaId: action.payload.empresaId,
        };
      }
      return state;

    default:
      return state;
  }
}

// Función para calcular totales
function calculateTotals(state: CartState): CartState {
  const totals = state.items.reduce(
    (acc, item) => {
      const itemTotal = item.price * item.quantity;
      const discountAmount = item.descuento ? (itemTotal * item.descuento) / 100 : 0;
      const finalItemTotal = itemTotal - discountAmount;
      
      return {
        total: acc.total + finalItemTotal,
        itemCount: acc.itemCount + item.quantity,
      };
    },
    { total: 0, itemCount: 0 }
  );

  return {
    ...state,
    total: totals.total,
    itemCount: totals.itemCount,
  };
}

// Crear contexto
const CartContext = createContext<{
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
} | null>(null);

// Provider del carrito
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Cargar carrito desde localStorage al inicializar
  useEffect(() => {
    const savedCart = localStorage.getItem('webgenerativa-cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        dispatch({ type: 'LOAD_CART', payload: parsedCart });
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('webgenerativa-cart', JSON.stringify(state));
  }, [state]);

  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  );
}

// Hook para usar el carrito
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

// Hook personalizado con métodos de conveniencia
export function useCartActions() {
  const { state, dispatch } = useCart();

  const addItem = (product: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    dispatch({ type: 'ADD_ITEM', payload: product });
  };

  const removeItem = (productId: number) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { productId } });
  };

  const updateQuantity = (productId: number, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const toggleCart = () => {
    dispatch({ type: 'TOGGLE_CART' });
  };

  const openCart = () => {
    dispatch({ type: 'OPEN_CART' });
  };

  const closeCart = () => {
    dispatch({ type: 'CLOSE_CART' });
  };

  const setEmpresa = (empresaId: number) => {
    dispatch({ type: 'SET_EMPRESA', payload: { empresaId } });
  };

  return {
    state,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    toggleCart,
    openCart,
    closeCart,
    setEmpresa,
  };
}