import React from 'react';
import { EmpresaCompleta } from '@/lib/types/webgenerator';
import ProductosGrid, { ProductosPorCategoria, ProductosLista } from './ProductosGrid';

interface EmpresaProductosViewProps {
  empresa: EmpresaCompleta;
  modo?: 'grid' | 'categoria' | 'lista';
  className?: string;
}

export default function EmpresaProductosView({ 
  empresa, 
  modo = 'categoria',
  className = ""
}: EmpresaProductosViewProps) {
  const productos = empresa.productos || [];
  
  // Si no hay productos, mostrar mensaje
  if (productos.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No hay productos disponibles
        </h3>
        <p className="text-gray-600">
          Esta empresa aún no ha agregado productos a su catálogo.
        </p>
      </div>
    );
  }

  // Modo grid simple
  if (modo === 'grid') {
    return (
      <ProductosGrid
        productos={productos}
        mostrarCategoria={true}
        className={className}
      />
    );
  }

  // Modo lista
  if (modo === 'lista') {
    return (
      <ProductosLista
        productos={productos}
        className={className}
      />
    );
  }

  // Modo por categorías (por defecto)
  // Agrupar productos por categoría
  const productosPorCategoria: Array<{
    categoria: {
      id: number;
      nombre: string;
      descripcion?: string;
    };
    productos: typeof productos;
  }> = [];

  // Primero, productos con categoría
  empresa.categorias?.forEach(categoria => {
    const productosDeCategoria = productos.filter(p => p.categoria_id === categoria.id);
    if (productosDeCategoria.length > 0) {
      productosPorCategoria.push({
        categoria: {
          id: categoria.id,
          nombre: categoria.nombre,
          descripcion: categoria.descripcion || undefined
        },
        productos: productosDeCategoria
      });
    }
  });

  // Luego, productos sin categoría
  const productosSinCategoria = productos.filter(p => !p.categoria_id);
  if (productosSinCategoria.length > 0) {
    productosPorCategoria.push({
      categoria: {
        id: 0,
        nombre: 'Sin Categoría',
        descripcion: 'Productos sin categoría asignada'
      },
      productos: productosSinCategoria
    });
  }

  return (
    <ProductosPorCategoria
      productosPorCategoria={productosPorCategoria}
      className={className}
    />
  );
}